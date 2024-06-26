import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import type { OptionTypeBase } from 'react-select';
import type { Props } from 'react-select/async';
import AsyncSelect from 'react-select/async';
import type { colorShade, colorType, themeType } from '../../utils/theme/theme';
import { MultiValueLabelComponent, OptionComponent } from './MultiSelect';
import { SelectComponent } from './Select';

interface ISelectAsync extends Omit<Props<OptionTypeBase, false>, 'isMulti'> {
  appTheme: themeType;
  color: colorType;
  colorShade: colorShade;
  client: ApolloClient<NormalizedCacheObject>;
  asyncOptions?: (
    inputValue: string,
    client: ApolloClient<NormalizedCacheObject>
  ) => Promise<
    Array<{
      value: string;
      label: string;
    }>
  >;
  onChange?: (valueObj: OptionTypeBase | null) => void;
  valueStrings?: string[];
  isMulti?: boolean;
}

function SelectAsync({ asyncOptions, client, valueStrings, isMulti, ...props }: ISelectAsync) {
  const theme = useTheme() as themeType;

  // use the styles of the normal select component for the async select component
  const AsyncSelectComponent = SelectComponent.withComponent(AsyncSelect);

  // keep track of whether something in this component is loading
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // calculate and store the value objects based on the provided value strings
  const [valueObjs, setValueObjs] = useState<OptionTypeBase[]>([]);
  const [prevValStrs, setPrevValStrs] = useState<string[]>([]);
  useEffect(() => {
    // only execute if:
    // (1) `valueStrings` is defined
    // (2) `valueStrings` is different from the previous array of value strings, `prevValStrs`
    // (3) `asyncOptions` is defined
    async function valueStringsToObjects() {
      if (valueStrings && JSON.stringify(valueStrings) !== JSON.stringify(prevValStrs) && asyncOptions) {
        // show the loading indicator
        setIsLoading(true);

        // for each value string, find the first match from the api and add it to valueObjs
        let allOptions: OptionTypeBase[] = [];
        const promises = valueStrings.map(async (valueStr) => {
          await asyncOptions(valueStr, client).then((options) => {
            if (options && options.length > 0) allOptions.push(options[0]); // add the first match to the value objects array
          });
        });
        await Promise.all(promises).then(() => {
          // wait for each promise to resolve, and then set the vlaue objects in state
          setValueObjs(allOptions);
        });

        // hide the loading indicator
        setIsLoading(false);

        // store the value strings
        // if this effect attempts to run again, but the value strings have not changed, the api will not be queried
        setPrevValStrs(valueStrings);
      }
    }
    valueStringsToObjects();
  }, [asyncOptions, client, prevValStrs, setPrevValStrs, valueStrings]);

  return (
    <AsyncSelectComponent
      client={client}
      loadOptions={asyncOptions ? (inputValue: string) => asyncOptions!(inputValue, client) : undefined}
      classNamePrefix={`react-select`}
      appTheme={props.appTheme}
      color={props.color}
      colorShade={props.colorShade}
      border={{ base: '1px solid transparent' }}
      value={valueObjs}
      onChange={props.onChange}
      isDisabled={props.isDisabled}
      cssExtra={props.cssExtra}
      cacheOptions
      isLoading={isLoading}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length === 0 ? 'Type to view options' : 'No matching options'
      }
      isMulti={isMulti ? true : false} // defaults to false
      components={{ MultiValueLabel: MultiValueLabelComponent, Option: OptionComponent }}
      styles={{
        multiValue: (base) => ({
          ...base,
          backgroundColor:
            theme.mode === 'light' ? theme.color.neutral.light[100] : theme.color.neutral.dark[200],
        }),
      }}
    />
  );
}

export { SelectAsync };
