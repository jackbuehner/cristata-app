import { css, Global, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ChevronDown20Regular, ErrorCircle20Regular } from '@fluentui/react-icons';
import Color from 'color';
import mongoose from 'mongoose';
import Select, { BaseSelectRef, Option } from 'rc-select';
import { BaseOptionType, LabelInValueType, RawValueType } from 'rc-select/lib/Select';
import { CSSProperties as CSS, useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import { FieldProps } from './Field';

const isValidObjectId = mongoose.Types.ObjectId.isValid;

interface ComboboxProps extends Omit<FieldProps, 'children'> {
  disabled?: boolean;
  optionHeight?: number;
  options: Values;
  values?: Values;
  onChange?: (values: Values) => void;
  onTextChange?: (value: string) => void;
  many?: boolean;
  notFoundContent?: string;
  showCurrentSelectionInOptions?: boolean;
}

type Values = StringValue[] | NumberValue[];
type StringValue = { value: string; label: string; disabled?: boolean; reason?: string };
type NumberValue = { value: number; label: string; disabled?: boolean; reason?: string };

function Combobox({ onChange, ...props }: ComboboxProps) {
  const theme = useTheme() as themeType;
  const selectRef = useRef<BaseSelectRef>(null);

  // manage internal state of selected values
  const [internalState, _setInternalState] = useState<Values>(props.values || []);
  const setInternalState = (newState: Values) => {
    _setInternalState(newState);
    onChange?.(newState);
  };

  // keep internal state in sync with changes made by parent
  useEffect(() => {
    if (props.values && JSON.stringify(props.values) !== JSON.stringify(internalState))
      _setInternalState(props.values);
  }, [internalState, props.values]);

  /**
   * Update the state based on the new selection.
   *
   * If `many` is `undefined` or `true`, the newly selected option is added
   * to the existing state array. Otherwise, the array contents are replaced
   * with the newly selected option.
   */
  const onSelect = (value: RawValueType | LabelInValueType, option: BaseOptionType) => {
    if (option.value && option.label) {
      if ((typeof internalState[0]?.value === 'string' || true) && typeof option.value === 'string') {
        if (props.many === false)
          setInternalState([
            { value: option.value, label: option.label, disabled: option.disabled, reason: option.reason },
          ]);
        else
          setInternalState([
            ...(internalState as StringValue[]),
            { value: option.value, label: option.label, disabled: option.disabled, reason: option.reason },
          ]);
      } else if ((typeof internalState[0]?.value === 'number' || true) && typeof option.value === 'number') {
        if (props.many === false)
          setInternalState([
            { value: option.value, label: option.label, disabled: option.disabled, reason: option.reason },
          ]);
        else
          setInternalState([
            ...(internalState as NumberValue[]),
            { value: option.value, label: option.label, disabled: option.disabled, reason: option.reason },
          ]);
      }
    }
  };

  // keep track of last search value in the combobox input field
  const [lastSearchValue, setLastSearchValue] = useState<string>('');

  // filter the provided options to exclude currently selected options
  // (unless showCurrentSelectionInOptions is true)
  const options = (props.options as StringValue[]).filter((option) => {
    if (props.showCurrentSelectionInOptions) {
      return true;
    } else if (props.values) {
      return !props.values.some(({ value }) => value.toString() === option?.value.toString());
    }
    return !internalState.some(({ value }) => value.toString() === option?.value.toString());
  });

  return (
    <div style={{ position: 'relative' }}>
      <SelectComponent
        theme={theme}
        color={props.color}
        ref={selectRef}
        dropdownRender={(menu) => {
          ReactTooltip.rebuild();

          return (
            <DropdownMenu theme={theme} optionHeight={props.optionHeight} color={props.color}>
              {menu}
            </DropdownMenu>
          );
        }}
        showSearch
        showArrow
        allowClear={false}
        inputIcon={<ChevronButton theme={theme} />}
        value={props.values || internalState}
        mode={props.many ? 'multiple' : undefined}
        dropdownAlign={{ offset: [0, 0] }}
        disabled={props.disabled}
        onSelect={onSelect}
        virtual={false}
        notFoundContent={props.notFoundContent || 'No match found. Try a different query.'}
        filterOption={(value, option) => {
          return (
            option?.value &&
            option.label &&
            (option.label.toString().toLowerCase().includes(lastSearchValue.toLowerCase()) ||
              option.value.toString().toLowerCase().includes(lastSearchValue.toLowerCase()))
          );
        }}
        onSearch={(value) => {
          setLastSearchValue(value);
          props.onTextChange?.(value);
        }}
      >
        {options.map(({ label, value, disabled, reason }) => {
          const optionProps = { value, label, disabled, 'data-tip': disabled && reason ? reason : label };
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
          }
          .rc-select-dropdown-hidden {
            display: none;
          }
        `}
      />
    </div>
  );
}

const SelectComponent = styled(Select)<{
  theme: themeType;
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
  theme: themeType;
  optionHeight?: number;
  disabled?: boolean;
  color?: colorType;
}>`
  z-index: 100;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200])};
  box-shadow: 0 5px 5px -3px rgb(0 0 0 / 20%), 0 8px 10px 1px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%);
  padding: 4px 0;
  margin: 0;
  border-radius: ${({ theme }) => theme.radius};

  .rc-select-item-option,
  .rc-select-item-empty {
    list-style: none;
    width: 100%;
    height: ${({ optionHeight }) => (optionHeight ? optionHeight : 30)}px;
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

const ChevronButton = styled(ChevronDown20Regular)<{ theme: themeType }>`
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
`;

export { Combobox };
