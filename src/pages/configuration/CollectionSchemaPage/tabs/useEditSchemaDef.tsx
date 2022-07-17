/* eslint-disable react-hooks/rules-of-hooks */
import { useWindowModal } from '../../../../hooks/useWindowModal';
import { TabBar, Tab } from '../../../../components/Tabs';
import { useState, SetStateAction } from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import { get as getProperty } from 'object-path';
import { Checkbox, Text, Number, SelectOne } from '../../../../components/ContentField';
import { Field } from '../../../../components/ContentField/Field';
import styled from '@emotion/styled/macro';
import { colorType } from '../../../../utils/theme/theme';
import Color from 'color';
import {
  SchemaDef,
  isTypeTuple,
  MongooseSchemaType,
} from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';

interface UseEditSchemaDefProps {
  label: string;
  id: string;
}

function useEditSchemaDef(props: UseEditSchemaDefProps): [React.ReactNode, () => void, () => void] {
  // create the modal
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const state = useAppSelector(({ collectionConfig }) => collectionConfig);
    const [activeTab, setActiveTab] = useState<number>(0);
    const def: SchemaDef | undefined = getProperty(state.collection?.schemaDef || {}, `${props.id}`);
    const schemaType: MongooseSchemaType | undefined = def
      ? isTypeTuple(def.type)
        ? def.type[1]
        : def.type
      : undefined;
    let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
    if (type?.includes('[') && type?.includes(']')) type = type.replace('[', '').replace(']', '');

    return {
      title: `${props.label}`,
      windowOptions: { name: `editSchemaField_${props.label}`, width: 370, height: 560 },
      styleString: `> div[class*='-PlainModalContent'] { padding: 0; }`,
      children: (
        <div>
          <TabBar
            activeTabIndex={activeTab}
            onActivate={(evt: { detail: { index: SetStateAction<number> } }) => setActiveTab(evt.detail.index)}
          >
            <Tab>Options</Tab>
            <Tab>Validations</Tab>
            <Tab>Advanced</Tab>
          </TabBar>
          <div style={{ padding: '20px 24px' }}>
            {activeTab === 0 ? (
              <>
                <Text isEmbedded label={'Display name'} value={def?.field?.label} />
                <Text isEmbedded label={'Short display name'} value={def?.column?.label} />
                <Text isEmbedded label={'API ID'} value={props.id} disabled />
                <Text isEmbedded label={'Description'} value={def?.field?.description} />
                {type === 'String' ||
                type === 'Strings' ||
                type === 'Number' ||
                type === 'Numbers' ||
                type === 'Float' ||
                type === 'Floats' ? (
                  <Checkbox
                    isEmbedded
                    label={'Select value from a predefined list of options'}
                    checked={!!def?.field?.options}
                  />
                ) : null}
                {!!def?.field?.options ? (
                  <IndentField color={'primary'}>
                    {def.field.options.map((option, index) => {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                          <div style={{ flexGrow: 1 }}>
                            <Text isEmbedded label={'Label'} value={option.label} />
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            {type === 'String' || type === 'Strings' ? (
                              <Text isEmbedded label={'Value'} value={option.value} />
                            ) : (
                              <Number
                                isEmbedded
                                type={type === 'Number' || type === 'Numbers' ? 'Int' : 'Float'}
                                label={'Value'}
                                value={option.value}
                              />
                            )}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <Field isEmbedded label={'Disabled'}>
                              <Checkbox isEmbedded label={''} checked={option.disabled} />
                            </Field>
                          </div>
                        </div>
                      );
                    })}
                  </IndentField>
                ) : null}
              </>
            ) : activeTab === 1 ? (
              <>
                <Checkbox
                  isEmbedded
                  label={'Make this field required'}
                  description={
                    'Prevent saving an entry if this field is not defined. Empty text fields are considered to be defined.'
                  }
                  checked={def?.field?.hidden === true}
                />
                <Checkbox
                  isEmbedded
                  label={'Set this field as unique'}
                  description={'Prevent saving an entry if this field is not unique.'}
                  checked={def?.unique === true}
                />
                <Checkbox
                  isEmbedded
                  label={'Require this field to match a specific pattern'}
                  description={'Only accept the specified regular expression.'}
                  checked={!!def?.rule}
                />
                {!!def?.rule ? (
                  <IndentField color={'primary'}>
                    <Text isEmbedded label={'Pattern'} value={def.rule.regexp.pattern} />
                    <Text isEmbedded label={'Flags'} value={def.rule.regexp.flags} />
                    <Text isEmbedded label={'Custom error message'} value={def.rule.message} />
                  </IndentField>
                ) : null}
              </>
            ) : (
              <>
                <Field isEmbedded label={'Search and sort'}>
                  <>
                    {type === 'String' || type === 'Strings' ? (
                      <Checkbox
                        isEmbedded
                        label={'Index this field for search'}
                        checked={def?.textSearch === true}
                      />
                    ) : null}
                    <Checkbox
                      isEmbedded
                      label={'Allow sorting this field in ascending or descending order in table views'}
                      checked={def?.column?.sortable === true}
                    />
                  </>
                </Field>
                <Field isEmbedded label={'Visibility'}>
                  <>
                    <Checkbox
                      isEmbedded
                      label={'Hide from item editor'}
                      checked={def?.field?.hidden === true}
                    />
                    <Checkbox
                      isEmbedded
                      label={'Hide from table views'}
                      checked={def?.column?.hidden === true}
                    />
                    <Checkbox
                      isEmbedded
                      label={'Make this field read only'}
                      checked={def?.modifiable === false}
                    />
                  </>
                </Field>
                <Field isEmbedded label={'Initialization'}>
                  <div>TODO: support default values</div>
                </Field>
                <Field isEmbedded label={'Setter'}>
                  <>
                    <Checkbox
                      isEmbedded
                      label={'Use a setter'}
                      description={'Set the value of this field when a condition is met.'}
                      checked={!!def?.setter}
                    />
                    {!!def?.setter ? (
                      <IndentField color={'primary'}>
                        <Text
                          isEmbedded
                          label={'Condition'}
                          value={JSON.stringify(def.setter.condition, null, 2)}
                        />
                        <Text isEmbedded label={'Value'} value={JSON.stringify(def.setter.value, null, 2)} />
                      </IndentField>
                    ) : null}
                  </>
                </Field>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <div style={{ flexGrow: 1 }}>
                    <Number isEmbedded type={'Int'} label={'Field order'} value={def?.field?.order} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <Number isEmbedded type={'Int'} label={'Column order'} value={def?.column?.order} />
                  </div>
                </div>
                <Number isEmbedded type={'Int'} label={'Column width'} value={def?.column?.width || 150} />
                {type === 'String' ||
                type === 'Strings' ||
                type === 'Number' ||
                type === 'Numbers' ||
                type === 'Float' ||
                type === 'Floats' ? (
                  <Checkbox
                    isEmbedded
                    label={'Style this field as chips in the table view'}
                    checked={!!def?.column?.chips}
                  />
                ) : null}
                {!!def?.column?.chips ? (
                  <IndentField color={'primary'}>
                    {(def.column.chips === true ? [] : def.column.chips).map((option, index) => {
                      const options = [
                        { label: 'Neutral', value: 'neutral' },
                        { label: 'Red', value: 'red' },
                        { label: 'Orange', value: 'orange' },
                        { label: 'Yellow', value: 'yellow' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
                        { label: 'Turquoise', value: 'turquoise' },
                        { label: 'Indigo', value: 'indigo' },
                        { label: 'Violet', value: 'violet' },
                      ];

                      return (
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                          <div style={{ flexGrow: 1 }}>
                            <Text isEmbedded label={'Label'} value={option.label} />
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            {type === 'String' || type === 'Strings' ? (
                              <Text isEmbedded label={'Value'} value={option.value} />
                            ) : (
                              <Number
                                isEmbedded
                                type={type === 'Number' || type === 'Numbers' ? 'Int' : 'Float'}
                                label={'Value'}
                                value={option.value}
                              />
                            )}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <SelectOne
                              isEmbedded
                              label={'Color'}
                              type={'String'}
                              value={
                                options.find((opt) => opt.value === option.color) || {
                                  label: 'Neutral',
                                  value: 'neutral',
                                }
                              }
                              options={options}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </IndentField>
                ) : null}
              </>
            )}
          </div>
        </div>
      ),
    };
  }, []);

  return [Window, showModal, hideModal];
}

const IndentField = styled.div<{ color: colorType }>`
  padding: 10px;
  margin-left: 28px;
  width: calc(100% - 28px);
  box-sizing: border-box;
  background: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][600]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]
    )
      .alpha(0.08)
      .string()};
  border-radius: ${({ theme }) => theme.radius};
`;

export { useEditSchemaDef };
