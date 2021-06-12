import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';
import ReactSelect, { OptionTypeBase, GroupTypeBase } from 'react-select';
import { buttonEffect } from '../Button';
import Color from 'color';
import Creatable from 'react-select/creatable';

interface ISelect<
  OptionType extends OptionTypeBase = { label: string; value: string },
  GroupType extends GroupTypeBase<OptionType> = GroupTypeBase<OptionType>
> {
  options?: ReadonlyArray<OptionType | GroupType>;
  val?: string;
  onChange?: (valueObj: OptionTypeBase | null) => void;
  isCreatable?: boolean;
  isDisabled?: boolean;
}

interface ISelectComponent extends ISelect {
  appTheme: themeType;
}

const SelectComponent = styled(ReactSelect)<ISelectComponent>`
  // the visible control for the select field
  .react-select__control {
    padding: 0;
    min-height: unset;
    line-height: 1.2;
    width: 100%;
    box-sizing: border-box;
    border-radius: ${({ appTheme: theme }) => theme.radius};
    border: none;
    box-shadow: ${({ appTheme: theme }) => theme.color.neutral[theme.mode][800]} 0px 0px 0px 1px inset;
    transition: box-shadow 240ms;
    font-family: ${({ appTheme: theme }) => theme.font['detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
    &:hover {
      box-shadow: ${({ appTheme: theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
    }
    &:focus-within {
      outline: none;
      box-shadow: ${({ appTheme: theme }) => theme.color.primary[800]} 0px 0px 0px 2px inset;
    }
  }
  // container with values (only one is is visible with single selects)
  .react-select__value-container {
    padding: 3.5px 8px;
    line-height: 1.2;
    font-size: 14px;
  }
  // indicator icons, displayed to the right of the value container
  .react-select__indicators {
    height: 32px;
  }
  // dropdown menu
  .react-select__menu {
    margin: 0;
    border-radius: ${({ appTheme: theme }) => theme.radius};
    z-index: 12;
  }
  // options in menu
  .react-select__option {
    font-family: ${({ appTheme: theme }) => theme.font['detail']};
    font-size: 14px;
    ${({ color, colorShade, appTheme: theme, isDisabled, backgroundColor, border }) =>
      buttonEffect(color, colorShade, theme, isDisabled, backgroundColor, border)}
  }
  // the option that is already selected
  .react-select__option--is-selected {
    background-color: ${({ appTheme: theme }) =>
      Color(theme.color.neutral[theme.mode][800]).alpha(0.15).string()};
    color: inherit;
  }
  // text styles when typing into select field
  .react-select__input > input {
    font-family: ${({ appTheme: theme }) => theme.font['detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
  }
`;

/**
 * A select field that allows one value to be selected.
 */
function Select(props: ISelect) {
  const theme = useTheme() as themeType;

  const getValue = (val?: string) => {
    if (val) return props.options?.find((opt) => opt.value === val);
    return undefined;
  };

  const CreatableSelectComponent = SelectComponent.withComponent(Creatable);

  return (
    <>
      {props.isCreatable ? (
        <CreatableSelectComponent
          options={props.options}
          classNamePrefix={`react-select`}
          appTheme={theme}
          color={`primary`}
          colorShade={600}
          backgroundColor={{ base: 'white' }}
          border={{ base: '1px solid transparent' }}
          value={getValue(props.val)}
          onChange={props.onChange}
          isDisabled={props.isDisabled}
        />
      ) : (
        <SelectComponent
          options={props.options}
          classNamePrefix={`react-select`}
          appTheme={theme}
          color={`primary`}
          colorShade={600}
          backgroundColor={{ base: 'white' }}
          border={{ base: '1px solid transparent' }}
          value={getValue(props.val)}
          onChange={props.onChange}
          isDisabled={props.isDisabled}
        />
      )}
    </>
  );
}

export { Select, SelectComponent };
