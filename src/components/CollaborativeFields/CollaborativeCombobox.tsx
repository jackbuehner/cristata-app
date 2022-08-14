import { css, Global, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ChevronDown20Regular, ErrorCircle20Regular } from '@fluentui/react-icons';
import Color from 'color';
import mongoose from 'mongoose';
import Select, { BaseSelectRef, Option } from 'rc-select';
import { BaseOptionType, DefaultOptionType } from 'rc-select/lib/Select';
import { CSSProperties as CSS, useCallback, useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import * as Y from 'yjs';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from '.';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { replaceCircular } from '../../utils/replaceCircular';
import { colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import utils from './utils';

const isValidObjectId = mongoose.Types.ObjectId.isValid;

interface CollaborativeComboboxProps extends CollaborativeFieldProps {
  /**
   * The height of options in the dropdown menu.
   */
  optionHeight?: number;
  options: Values<string>;
  onChange?: (values: Values<string>) => void;
  onSearchChange?: (text: string) => void;
  /**
   * Whether many options can be selected. Defaults to `true`.
   */
  many?: boolean;
  notFoundContent?: string;
  showCurrentSelectionInOptions?: boolean;
}

type Values<T extends string | number> = Value<T>[];

interface Value<T extends string | number> extends BaseValue {
  value: T;
  label: string;
}

interface UnpopulatedRefValue extends BaseValue {
  _id: string;
  label?: string;
}

interface PopulatedRefValue extends BaseValue {
  _id: string;
  label: string;
}

interface BaseValue {
  disabled?: boolean;
  reason?: string;
  children?: React.ReactChildren;
  [key: string]: unknown;
}

function CollaborativeCombobox(props: CollaborativeComboboxProps) {
  const { y, onChange, ...labelProps } = props;
  const yarray = y.ydoc?.getArray<Value<string>>(y.field);

  const theme = useTheme();
  const forceUpdate = useForceUpdate();
  const selectRef = useRef<BaseSelectRef>(null);

  // keep track of the selected values shared type
  const [selected, setSelected] = useState<Value<string>[]>(yarray?.toArray() || []);
  useEffect(() => {
    if (yarray) {
      if (selected.length !== yarray.toArray().length) {
        setSelected(yarray.toArray());
      }

      const handleChange = (evt: Y.YArrayEvent<Value<string>>) => {
        if (evt.changes.delta) {
          setSelected(yarray.toArray());

          // send the change to the parent
          onChange?.(yarray.toArray());

          // rerender the component
          forceUpdate();
        }
      };

      yarray.observe(handleChange);
      return () => {
        yarray.unobserve(handleChange);
      };
    }
  }, [forceUpdate, onChange, selected.length, yarray]);

  /**
   * Update the y shared map type based on the new selection.
   *
   * If `many` is `undefined` or `true`, the newly selected option is added
   * to the existing selection array. Otherwise, the array contents are replaced
   * with the newly selected option.
   */
  const onSelect = (value: unknown, option: BaseOptionType) => {
    if (yarray && option.value && option.label) {
      y.ydoc?.transact(() => {
        // delete existing values if only one value can be set
        if (props.many === false) yarray.delete(0, yarray.length);

        // push the new value into the end of the array
        yarray.push([replaceCircular({ ...option, value: option.value, label: option.label })]);
        utils.setUnsaved(props.y.ydoc, props.y.field.split('‾‾')[1] || props.y.field);
      });
    }
  };

  // keep track of last search value in the combobox input field
  // but do not sync across devices
  const [search, setSearch] = useState<string>('');

  // filter the provided options to exclude currently selected options
  // (unless showCurrentSelectionInOptions is true)
  const options = props.options.filter((option) => {
    if (props.showCurrentSelectionInOptions) return true;

    return !selected.some(({ value }) => value === option?.value);
  });

  /**
   * Returns whether the option should appear based on the last search value
   * (there must be a match in label or value of the option).
   */
  const filterOption = useCallback(
    (option: BaseOptionType | DefaultOptionType | undefined) => {
      if (!option?.value || !option.label) return false;

      return (
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.value.toLowerCase().includes(search.toLowerCase())
      );
    },
    [search]
  );

  // update the height of the menu every time the visible options change
  const maxHeight = 260;
  const height = Math.min((options.filter(filterOption).length || 1) * 30 + 8, maxHeight);

  // track the open state
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenClass, setIsOpenClass] = useState(false);

  useEffect(() => {
    try {
      // close on scroll
      const closeOnScroll = (e: Event) => {
        const target = e.target as HTMLElement | null;
        const isSelf = target?.classList?.contains('rc-virtual-list-holder') || false;

        // only close if the scroll event did not occur in the combobox dropdown
        if (!isSelf) {
          setTimeout(() => setIsOpenClass(false), 100);
          setTimeout(() => setIsOpen(false), 240);
        }
      };
      document.addEventListener('scroll', closeOnScroll, { capture: true, passive: true });
      return document.removeEventListener('scroll', closeOnScroll);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const Content = (
    <div style={{ position: 'relative' }}>
      <SelectComponent
        color={props.color}
        ref={selectRef}
        listHeight={maxHeight}
        open={isOpen}
        onDropdownVisibleChange={(open) => {
          // we have to delay this so that the parent finished rerendering
          // before adding the open class, which triggers a css transition
          setTimeout(() => setIsOpenClass(open), 100);
          if (!open) setTimeout(() => setIsOpen(open), 240);
          else setIsOpen(open);
        }}
        dropdownRender={(menu) => {
          ReactTooltip.rebuild();

          return (
            <DropdownMenu
              optionHeight={props.optionHeight || 30}
              color={props.color}
              style={{ '--height': height + 'px', '--maxHeight': maxHeight + 'px' } as React.CSSProperties}
              className={isOpenClass ? 'open' : ''}
            >
              {menu}
            </DropdownMenu>
          );
        }}
        showSearch
        showArrow
        allowClear={false}
        inputIcon={<ChevronButton />}
        value={selected}
        mode={props.many !== false ? 'multiple' : undefined}
        dropdownAlign={{ offset: [0, 0] }}
        disabled={props.disabled}
        onSelect={onSelect}
        virtual={false}
        notFoundContent={props.notFoundContent || 'No match found. Try a different query.'}
        filterOption={(value, option) => filterOption(option)}
        onSearch={(value) => {
          setSearch(value);
          props.onSearchChange?.(value);
        }}
      >
        {options.map(({ label, value, disabled, reason, ...rest }) => {
          const optionProps = {
            value,
            label,
            disabled,
            'data-tip': disabled && reason ? reason : label,
            ...rest,
          };
          const labelStyle: CSS = { overflow: 'hidden', textOverflow: 'ellipsis' };
          const metaStyle: CSS = { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 };
          const errorIconStyle: CSS = { display: 'flex', cursor: 'help', color: theme.color.danger[800] };
          const idStyle: CSS = { color: theme.color.neutral[theme.mode][800] };
          return (
            <Option {...optionProps} key={value}>
              <div style={labelStyle}>{label}</div>
              <div style={metaStyle}>
                {isValidObjectId(value) ? <code style={idStyle}>{value.toString().slice(-6)}</code> : null}
                {disabled && reason ? <ErrorCircle20Regular style={errorIconStyle} /> : null}
              </div>
            </Option>
          );
        })}
      </SelectComponent>
      <Global
        styles={css`
          .rc-select-dropdown {
            z-index: 100;
            position: absolute;
          }
          .rc-select-dropdown-hidden {
            display: none;
          }
          .rc-select-dropdown-placement-topLeft > div > div {
            flex-direction: column-reverse;
          }
        `}
      />
    </div>
  );

  if (props.label) {
    return (
      <CollaborativeFieldWrapper {...labelProps} y={y} label={props.label}>
        {Content}
      </CollaborativeFieldWrapper>
    );
  }

  return Content;
}

const SelectComponent = styled(Select)<{
  color?: colorType;
  font?: keyof themeType['font'];
}>`
  input[type='search'] {
    opacity: 1 !important;
    resize: none;
    padding: 10px 8px;
    line-height: 16px;
    background-color: transparent;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
    width: 100%;
    box-sizing: border-box;
    border-radius: ${({ theme }) => theme.radius};
    border: none;
    appearance: none; /* override native appearance (safari fix) */
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
    transition: box-shadow 240ms;
    font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
    &:hover {
      box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
    }
    &:focus {
      outline: none;
      box-shadow: ${({ theme, color }) => {
          if (color === 'neutral') color = undefined;
          return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
        }}
        0px 0px 0px 2px inset;
    }
    position: relative;
    z-index: 1;
  }

  .rc-select-selection-search {
    width: 100% !important;
  }

  .rc-select-selection-search-mirror {
    display: none;
  }

  .rc-select-selection-item {
    display: ${({ mode }) => (mode === 'multiple' ? 'none' : 'block')};
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px 8px;
    background-color: transparent;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
    font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
  }
`;

const DropdownMenu = styled.div<{
  optionHeight: number;
  disabled?: boolean;
  color?: colorType;
}>`
  z-index: 100;
  padding: 0;
  margin: 0;
  height: var(--maxHeight);
  display: flex;
  flex-direction: column;

  .rc-virtual-list-holder,
  .rc-select-item-empty {
    height: 0 !important;
    padding: 0;
    max-height: unset !important;
    background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200])};
    box-shadow: 0 5px 5px -3px rgb(0 0 0 / 20%), 0 8px 10px 1px rgb(0 0 0 / 14%),
      0 3px 14px 2px rgb(0 0 0 / 12%);
    border-radius: ${({ theme }) => theme.radius};
    box-sizing: border-box;
    opacity: 0;
    transition: opacity 240ms, height 0ms ease 240ms, padding 0ms ease 240ms;
  }

  &.open .rc-virtual-list-holder,
  &.open .rc-select-item-empty {
    height: var(--height) !important;
    padding-top: 4px;
    padding-bottom: 4px;
    opacity: 1;
    transition: height 240ms cubic-bezier(0.1, 0.9, 0.2, 1);
  }

  .rc-select-item-option,
  .rc-select-item-empty {
    list-style: none;
    width: 100%;
    height: ${({ optionHeight }) => optionHeight}px;
    box-sizing: border-box;
    padding: 0 16px;
    display: flex;
    align-items: center;
    font-family: ${({ theme }) => theme.font.detail};
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    cursor: default;
    color: ${({ theme }) => theme.color.neutral[theme.mode][600]};
  }

  .rc-select-item-option-content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .rc-select-item-option:not(.rc-select-item-option-disabled) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
    ${({ theme, color }) =>
      buttonEffect(
        color || 'primary',
        theme.mode === 'light' ? 700 : 300,
        theme,
        false,
        { base: 'transparent' },
        { base: '1px solid transparent' }
      )};
  }

  .rc-select-item-option-active:not(.rc-select-item-option-disabled) {
    background-color: ${({ theme, color }) => {
      const colorShade = theme.mode === 'light' ? 700 : 300;
      if (!color) color = 'primary';
      if (color === 'neutral') {
        return Color(theme.color[color][theme.mode][colorShade]).alpha(0.1).string();
      }
      return Color(theme.color[color][colorShade]).alpha(0.1).string();
    }};
  }

  .rc-select-item-option-selected:not(.rc-select-item-option-disabled) {
    font-weight: 600;
    background-color: ${({ theme, color }) => {
      const colorShade = theme.mode === 'light' ? 700 : 300;
      if (!color) color = 'primary';
      if (color === 'neutral') {
        return Color(theme.color[color][theme.mode][colorShade]).alpha(0.2).string();
      }
      return Color(theme.color[color][colorShade]).alpha(0.2).string();
    }};
  }

  .rc-select-item-option-state {
    display: none;
  }

  .rc-select-item-empty {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
    font-style: italic;
  }
`;

function ChevronButton() {
  return (
    <ChevronIconWrapper>
      <ChevronDown20Regular />
    </ChevronIconWrapper>
  );
}

const ChevronIconWrapper = styled.span`
  position: absolute;
  top: 1px;
  right: 0;
  border-color: transparent !important;
  height: 34px;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

export { CollaborativeCombobox };
export type { Value, Values, PopulatedRefValue, UnpopulatedRefValue };
