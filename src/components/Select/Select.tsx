import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { useTheme, type SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import ReactSelect, { components, type GroupTypeBase, type OptionTypeBase } from 'react-select';
import Creatable from 'react-select/creatable';
import type { themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import { SelectAsync } from './SelectAsync';

interface ISelect<
  OptionType extends OptionTypeBase = { label: string; value: string },
  GroupType extends GroupTypeBase<OptionType> = GroupTypeBase<OptionType>
> {
  options?: ReadonlyArray<OptionType | GroupType>;
  loadOptions?: (
    inputValue: string,
    client: ApolloClient<NormalizedCacheObject>
  ) => Promise<
    Array<{
      value: string;
      label: string;
    }>
  >;
  val?: string;
  onChange?: (valueObj: OptionTypeBase | null) => void;
  isCreatable?: boolean;
  isDisabled?: boolean;
  async?: boolean;
  cssExtra?: SerializedStyles;
  client: ApolloClient<NormalizedCacheObject>;
}

interface ISelectComponent extends ISelect {
  appTheme: themeType;
  textColor?: { default: string; focused: string };
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
    background-color: transparent;
    color: ${({ textColor, appTheme: theme }) => textColor?.default || theme.color.neutral[theme.mode][1400]};
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
  .react-select__control--is-focused {
    background-color: white;
  }
  // container with values (only one is is visible with single selects)
  .react-select__value-container {
    padding: 3.5px 8px;
    line-height: 1.2;
    font-size: 14px;
  }
  // value
  .react-select__single-value {
    color: ${({ textColor, appTheme: theme }) => textColor?.default || theme.color.neutral[theme.mode][1400]};
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
    background: ${({ appTheme: theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[300])};
  }
  // options in menu
  .react-select__option {
    font-family: ${({ appTheme: theme }) => theme.font['detail']};
    font-size: 14px;
    color: ${({ appTheme: theme }) => theme.color.neutral[theme.mode][1400]};
  }
  .react-select__option--is-disabled {
    color: ${({ appTheme: theme }) => theme.color.neutral[theme.mode][1000]};
  }
  .react-select__option:not(.react-select__option--is-disabled) {
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
  // notice text (e.g. 'no options')
  .react-select__menu-notice {
    font-family: ${({ appTheme: theme }) => theme.font['detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
    color: ${({ appTheme: theme }) => theme.color.neutral[theme.mode][1000]};
  }
  ${({ cssExtra }) => cssExtra}
`;

/**
 * A select field that allows one value to be selected.
 */
function Select(props: ISelect) {
  const theme = useTheme() as themeType;

  /**
   * Converts the value to a value object
   */
  const getValueObject = (val?: string) => {
    if (val) return props.options?.find((opt) => opt.value === val);
    return undefined;
  };

  // use the styles of the normal select component for the creatable select component
  const CreatableSelectComponent = SelectComponent.withComponent(Creatable);

  if (props.isCreatable && !props.async) {
    return (
      <CreatableSelectComponent
        client={props.client}
        options={props.options}
        classNamePrefix={`react-select`}
        appTheme={theme}
        color={`primary`}
        colorShade={theme.mode === 'light' ? 600 : 300}
        backgroundColor={{ base: 'transparent' }}
        textColor={{
          default: theme.color.neutral[theme.mode][1400],
          focused: theme.color.neutral[theme.mode][100],
        }}
        border={{ base: '1px solid transparent' }}
        value={getValueObject(props.val)}
        onChange={props.onChange}
        isDisabled={props.isDisabled}
        cssExtra={props.cssExtra}
      />
    );
  }

  if (!props.isCreatable && props.async) {
    return (
      <SelectAsync
        client={props.client}
        asyncOptions={
          props.loadOptions ? (inputValue: string) => props.loadOptions!(inputValue, props.client) : undefined
        }
        classNamePrefix={`react-select`}
        appTheme={theme}
        color={`primary`}
        colorShade={theme.mode === 'light' ? 600 : 300}
        backgroundColor={{ base: 'transparent' }}
        border={{ base: '1px solid transparent' }}
        valueStrings={props.val && props.val !== 'undefined' ? [props.val] : undefined}
        onChange={props.onChange}
        isDisabled={props.isDisabled}
        cssExtra={props.cssExtra}
        cacheOptions
      />
    );
  }

  return (
    <SelectComponent
      client={props.client}
      options={props.options}
      classNamePrefix={`react-select`}
      appTheme={theme}
      color={`primary`}
      colorShade={theme.mode === 'light' ? 600 : 300}
      backgroundColor={{ base: 'transparent' }}
      border={{ base: '1px solid transparent' }}
      value={getValueObject(props.val)}
      onChange={props.onChange}
      isDisabled={props.isDisabled}
      cssExtra={props.cssExtra}
    />
  );
}

/**
 * Custom option component that filters out hidden options.
 */
function Option(props: any) {
  if (props.data.hidden) return null;
  return <components.Option {...props} />;
}

export { Option, Select, SelectComponent };
