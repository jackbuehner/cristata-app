import { SerializedStyles, useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { OptionsType, OptionTypeBase, GroupTypeBase } from 'react-select';
import Creatable from 'react-select/creatable';
import { SelectComponent } from './Select';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ClientConsumer } from '../../graphql/client';
import { SelectAsync } from './SelectAsync';

interface IMultiSelect<
  OptionType extends OptionTypeBase = { label: string; value: string },
  GroupType extends GroupTypeBase<OptionType> = GroupTypeBase<OptionType>
> {
  options?: ReadonlyArray<OptionType | GroupType>;
  //loadOptions?: (inputValue: string, callback: (options: OptionsType<OptionType>) => void) => void;
  loadOptions?: (
    inputValue: string,
    client: ApolloClient<NormalizedCacheObject>
  ) => Promise<
    Array<{
      value: string;
      label: string;
    }>
  >;
  val?: string[];
  onChange?: (valueObjs: OptionTypeBase | OptionsType<OptionTypeBase> | null) => void;
  isCreatable?: boolean;
  isDisabled?: boolean;
  async?: boolean;
  cssExtra?: SerializedStyles;
  client: ApolloClient<NormalizedCacheObject>;
}

/**
 * A select field that allows multiple value to be selected.
 */
function MultiSelect(props: IMultiSelect) {
  const theme = useTheme() as themeType;

  /**
   * Converts the values to value objects (for the async select)
   */
  const getValueObjects = (isCreatable: boolean, values?: string[]) => {
    if (values) {
      let valueObjs: Array<OptionTypeBase | OptionsType<OptionTypeBase>> = [];
      values.forEach((value) => {
        const foundValue = props.options?.find((opt) => opt.value === value);
        if (foundValue) {
          // if the found value exists, add it to valueObjs
          valueObjs.push(foundValue);
        } else if (isCreatable) {
          // if the found value does not exist, but the select is creatable,
          // create a new value object that is not predefined
          valueObjs.push({
            value: value.toString().toLowerCase(),
            label: value,
          });
        }
      });
      return valueObjs;
    }
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
        colorShade={600}
        backgroundColor={{ base: 'white' }}
        border={{ base: '1px solid transparent' }}
        value={getValueObjects(true, props.val)}
        onChange={props.onChange}
        isMulti
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
        colorShade={600}
        valueStrings={props.val}
        onChange={props.onChange}
        isMulti
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
      colorShade={600}
      backgroundColor={{ base: 'white' }}
      border={{ base: '1px solid transparent' }}
      value={getValueObjects(false, props.val)}
      onChange={props.onChange}
      isMulti
      isDisabled={props.isDisabled}
      cssExtra={props.cssExtra}
    />
  );
}

function MultiSelectParent(props: Omit<IMultiSelect, 'client'>) {
  return <ClientConsumer>{(client) => <MultiSelect {...props} client={client} />}</ClientConsumer>;
}

export { MultiSelectParent as MultiSelect };
