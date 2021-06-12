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
  val?: string;
  onChange?: (valueObjs: OptionTypeBase | OptionsType<OptionTypeBase> | null) => void;
  isCreatable?: boolean;
  isDisabled?: boolean;
}

/**
 * A select field that allows multiple value to be selected.
 */
function MultiSelect(props: IMultiSelect) {
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
          value={getValue(props.val)}
          onChange={props.onChange}
          isMulti
          isDisabled={props.isDisabled}
        />
      )}
    </>
  );
}

export { MultiSelect };
