import { useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { OptionsType, OptionTypeBase, GroupTypeBase } from 'react-select';
import Creatable from 'react-select/creatable';
import { SelectComponent } from './Select';
import AsyncSelect from 'react-select/async';
import { useState } from 'react';
import { useEffect } from 'react';

interface IMultiSelect<
  OptionType extends OptionTypeBase = { label: string; value: string },
  GroupType extends GroupTypeBase<OptionType> = GroupTypeBase<OptionType>
> {
  options?: ReadonlyArray<OptionType | GroupType>;
  //loadOptions?: (inputValue: string, callback: (options: OptionsType<OptionType>) => void) => void;
  loadOptions?: (inputValue: string) => Promise<
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

  // once `loadOptions` becomes available, store the options returned by the function
  const [asyncOptions, setAsyncOptions] = useState<Array<OptionTypeBase>>();
  useEffect(() => {
    async function updateOptions() {
      if (props.loadOptions) {
        const options = await props.loadOptions!('');
        setAsyncOptions(options);
      }
    }
    updateOptions();
  }, [props.loadOptions]);

  /**
   * Converts the values to value objects (for the async select)
   */
  const getValueObjectsAsync = (values?: string[]) => {
    if (values && props.loadOptions) {
      let valueObjs: Array<OptionTypeBase> = [];
      values.forEach((value) => {
        const options = asyncOptions;

        if (options) {
          const foundValue = options.find((opt) => opt.value === value);
          if (foundValue) {
            // if the found value exists, add it to valueObjs
            valueObjs.push(foundValue);
          }
        }
      });
      return valueObjs;
    }
    return undefined;
  };

  // use the styles of the normal select component for the creatable select component
  const CreatableSelectComponent = SelectComponent.withComponent(Creatable);

  // use the styles of the normal select component for the async select component
  const AsyncSelectComponent = SelectComponent.withComponent(AsyncSelect);

  if (props.isCreatable && !props.async) {
    return (
      <CreatableSelectComponent
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
      />
    );
  }

  if (!props.isCreatable && props.async) {
    return (
      <AsyncSelectComponent
        loadOptions={props.loadOptions}
        classNamePrefix={`react-select`}
        appTheme={theme}
        color={`primary`}
        colorShade={600}
        backgroundColor={{ base: 'white' }}
        border={{ base: '1px solid transparent' }}
        value={getValueObjectsAsync(props.val)}
        onChange={props.onChange}
        isMulti
        isDisabled={props.isDisabled}
        cacheOptions
      />
    );
  }

  return (
    <SelectComponent
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
    />
  );
}

export { MultiSelect };
