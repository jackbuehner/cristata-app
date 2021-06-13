import { useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { OptionsType, OptionTypeBase, GroupTypeBase } from 'react-select';
import Creatable from 'react-select/creatable';
import { SelectComponent } from './Select';

interface IMultiSelect<
  OptionType extends OptionTypeBase = { label: string; value: string },
  GroupType extends GroupTypeBase<OptionType> = GroupTypeBase<OptionType>
> {
  options?: ReadonlyArray<OptionType | GroupType>;
  val?: string[];
  onChange?: (valueObjs: OptionTypeBase | OptionsType<OptionTypeBase> | null) => void;
  isCreatable?: boolean;
  isDisabled?: boolean;
}

/**
 * A select field that allows multiple value to be selected.
 */
function MultiSelect(props: IMultiSelect) {
  const theme = useTheme() as themeType;

  const getValue = (isCreatable: boolean, values?: string[]) => {
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
          value={getValue(true, props.val)}
          onChange={props.onChange}
          isMulti
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
          value={getValue(false, props.val)}
          onChange={props.onChange}
          isMulti
          isDisabled={props.isDisabled}
        />
      )}
    </>
  );
}

export { MultiSelect };
