import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Dismiss24Regular } from '@fluentui/react-icons';
import {
  deconstructSchema,
  isTypeTuple,
  MongooseSchemaType,
  NumberOption,
  SchemaDef,
} from '@jackbuehner/cristata-generator-schema';
import Color from 'color';
import { get as getProperty } from 'object-path';
import pluralize from 'pluralize';
import { SetStateAction, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, buttonEffect } from '../../../../../components/Button';
import {
  Checkbox,
  Code,
  DateTime,
  Number,
  ReferenceMany,
  ReferenceOne,
  SelectMany,
  SelectOne,
  Text,
} from '../../../../../components/ContentField';
import { Field } from '../../../../../components/ContentField/Field';
import { Tab, TabBar } from '../../../../../components/Tabs';
import { useAppSelector } from '../../../../../redux/hooks';
import { setRootSchemaProperty } from '../../../../../redux/slices/collectionSlice';
import { camelToDashCase } from '../../../../../utils/camelToDashCase';
import { notEmpty } from '../../../../../utils/notEmpty';
import { colorType } from '../../../../../utils/theme/theme';
import { uncapitalize } from '../../../../../utils/uncapitalize';

interface EditSchemaDefProps {
  id: string;
  setName?: (name: string) => void;
}

function EditSchemaDef(props: EditSchemaDefProps) {
  const theme = useTheme();
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<number>(0);
  const deconstructedSchema = deconstructSchema(state.collection?.schemaDef || {});
  const def: SchemaDef | undefined = getProperty(state.collection?.schemaDef || {}, `${props.id}`);
  const schemaType: MongooseSchemaType | undefined = def
    ? isTypeTuple(def.type)
      ? def.type[1]
      : def.type
    : undefined;
  let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
  if (type?.includes('[') && type?.includes(']')) type = type.replace('[', '').replace(']', '');

  const isBranching = type === 'JSON' && def?.field?.custom;
  const isInBranch = props.id.includes('.field.custom.');
  const isDocArray = props.id.includes('.0.#label');
  const isInDocArray = props.id.includes('.0.') && !props.id.includes('.0.#label');
  const isMarkdown = type === 'String' && def?.field?.markdown;
  const isRichText =
    type === 'String' &&
    !isInBranch &&
    !isDocArray &&
    !isInDocArray &&
    !isMarkdown &&
    def?.field?.tiptap &&
    props.id === 'body';
  const isReferenceOne = def?.type && isTypeTuple(def.type) && def.type[1] === 'ObjectId';

  const isStageField = props.id === 'stage' && type === 'Float';

  const onOptionChange = {
    setLabel: (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
      dispatch(setRootSchemaProperty(props.id, `field.options.${index}.label`, e.currentTarget.value));
    },
    setValueStr: (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
      dispatch(setRootSchemaProperty(props.id, `field.options.${index}.value`, e.currentTarget.value));
    },
    setValueNum: (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      dispatch(setRootSchemaProperty(props.id, `field.options.${index}.value`, e.currentTarget.value));
    },
    setDisabled: (e: React.ChangeEvent<HTMLInputElement>, index: number, invert: boolean = false) => {
      dispatch(
        setRootSchemaProperty(
          props.id,
          `field.options.${index}.disabled`,
          invert ? !e.currentTarget.checked : e.currentTarget.checked
        )
      );
    },
  };

  type Chip = {
    value: string | number;
    label?: string;
    color?:
      | 'primary'
      | 'danger'
      | 'success'
      | 'red'
      | 'orange'
      | 'yellow'
      | 'green'
      | 'blue'
      | 'turquoise'
      | 'indigo'
      | 'violet'
      | 'neutral';
  };
  const getStage = (options: NumberOption[], findValue: number, chips?: boolean | Chip[]) => {
    return options
      .map(
        (
          opt,
          index
        ): NumberOption & {
          index: number;
          chipIndex?: number;
          chip?: Chip;
        } => {
          if (Array.isArray(chips)) {
            const chipIndex = chips.findIndex((chip) => chip.value === opt.value);
            const chip = chips[chipIndex];
            return { ...opt, index, chipIndex, chip };
          }
          return { ...opt, index };
        }
      )
      .filter((opt) => opt.value === findValue);
  };

  return (
    <div>
      <TabBar
        activeTabIndex={activeTab}
        onActivate={(evt: { detail: { index: SetStateAction<number> } }) => setActiveTab(evt.detail.index)}
        style={{
          position: 'sticky',
          top: 0,
          background: theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200],
          borderBottom: `1px solid ${theme.color.neutral[theme.mode][theme.mode === 'light' ? 200 : 300]}`,
        }}
      >
        <Tab>Options</Tab>
        <Tab>Validations</Tab>
        <Tab>Advanced</Tab>
        {isRichText ? <Tab>Editor</Tab> : null}
      </TabBar>
      <div style={{ padding: '20px 24px' }}>
        {activeTab === 0 ? (
          <>
            {!isStageField ? (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                <div style={{ flex: 3 }}>
                  <Text
                    isEmbedded
                    label={'Display name'}
                    value={def?.field?.label}
                    onChange={(e) => {
                      if (props.setName) props.setName(e.currentTarget.value);
                      dispatch(setRootSchemaProperty(props.id, 'field.label', e.currentTarget.value));
                    }}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <Text
                    isEmbedded
                    label={'Short display name'}
                    value={def?.column?.label}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, 'column.label', e.currentTarget.value))
                    }
                  />
                </div>
              </div>
            ) : null}
            {!isBranching && !isStageField ? (
              <Text
                isEmbedded
                label={'Description'}
                description={'Display a hint for content editors.'}
                value={def?.field?.description}
                onChange={(e) =>
                  dispatch(setRootSchemaProperty(props.id, 'field.description', e.currentTarget.value))
                }
              />
            ) : null}
            {!isDocArray &&
            !isMarkdown &&
            !isStageField &&
            (type === 'String' ||
              type === 'Strings' ||
              type === 'Number' ||
              type === 'Numbers' ||
              type === 'Float' ||
              type === 'Floats') ? (
              <Field isEmbedded label={'Value options'}>
                <>
                  <Checkbox
                    isEmbedded
                    label={'Select value from a predefined list of options'}
                    checked={!!def?.field?.options}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        dispatch(setRootSchemaProperty(props.id, 'field.options', []));
                      } else {
                        dispatch(setRootSchemaProperty(props.id, 'field.options', undefined));
                      }
                    }}
                  />
                </>
              </Field>
            ) : null}
            {!!def?.field?.options ? (
              isStageField ? (
                <>
                  {getStage(def.field.options as NumberOption[], 1.1, def.column?.chips).map((option, key) => {
                    return (
                      <Field isEmbedded label={'Planning (1.1)'} key={key}>
                        <>
                          <Checkbox
                            isEmbedded
                            label={'Enable this stage'}
                            checked={option.disabled !== true}
                            onChange={(e) => onOptionChange.setDisabled(e, option.index, true)}
                          />
                          {option.disabled !== true ? (
                            <IndentField color={'primary'}>
                              <Text
                                isEmbedded
                                label={'Label'}
                                value={option.label}
                                onChange={(e) => onOptionChange.setLabel(e, option.index)}
                              />
                            </IndentField>
                          ) : null}
                        </>
                      </Field>
                    );
                  })}
                  {getStage(def.field.options as NumberOption[], 2.1, def.column?.chips).map((option, key) => {
                    return (
                      <Field isEmbedded label={'Draft (2.1)'} key={key}>
                        <>
                          <Checkbox
                            isEmbedded
                            label={'Enable this stage'}
                            checked={option.disabled !== true}
                            onChange={(e) => onOptionChange.setDisabled(e, option.index, true)}
                          />
                          {option.disabled !== true ? (
                            <IndentField color={'primary'}>
                              <Text
                                isEmbedded
                                label={'Label'}
                                value={option.label}
                                onChange={(e) => onOptionChange.setLabel(e, option.index)}
                              />
                            </IndentField>
                          ) : null}
                        </>
                      </Field>
                    );
                  })}
                  {getStage(def.field.options as NumberOption[], 3.1, def.column?.chips).map((option, key) => {
                    return (
                      <Field isEmbedded label={'Pending Review (3.1)'} key={key}>
                        <>
                          <Checkbox
                            isEmbedded
                            label={'Enable this stage'}
                            checked={option.disabled !== true}
                            onChange={(e) => onOptionChange.setDisabled(e, option.index, true)}
                          />
                          {option.disabled !== true ? (
                            <IndentField color={'primary'}>
                              <Text
                                isEmbedded
                                label={'Label'}
                                value={option.label}
                                onChange={(e) => onOptionChange.setLabel(e, option.index)}
                              />
                            </IndentField>
                          ) : null}
                        </>
                      </Field>
                    );
                  })}
                  {getStage(def.field.options as NumberOption[], 4.1, def.column?.chips).map((option, key) => {
                    return (
                      <Field isEmbedded label={'Ready (4.1)'} key={key}>
                        <>
                          <Checkbox
                            isEmbedded
                            label={'Enable this stage'}
                            checked={option.disabled !== true}
                            onChange={(e) => onOptionChange.setDisabled(e, option.index, true)}
                          />
                          {option.disabled !== true ? (
                            <IndentField color={'primary'}>
                              <Text
                                isEmbedded
                                label={'Label'}
                                value={option.label}
                                onChange={(e) => onOptionChange.setLabel(e, option.index)}
                              />
                            </IndentField>
                          ) : null}
                        </>
                      </Field>
                    );
                  })}
                  {getStage(def.field.options as NumberOption[], 5.2, def.column?.chips).map((option, key) => {
                    return (
                      <Field
                        isEmbedded
                        label={'Published (5.2)'}
                        key={key}
                        description={
                          'This stage can be enabled or disabled by toggling the "Allow items to be published" option in the collection options.'
                        }
                      >
                        <>
                          <IndentField color={'primary'}>
                            <Text
                              isEmbedded
                              label={'Label'}
                              value={option.label}
                              onChange={(e) => onOptionChange.setLabel(e, option.index)}
                            />
                          </IndentField>
                        </>
                      </Field>
                    );
                  })}
                  <Field isEmbedded label={'Custom stages'}>
                    <IndentField color={'primary'}>
                      {(def.field.options as NumberOption[])
                        .map((opt, index): NumberOption & { index: number } => ({ ...opt, index }))
                        .filter(
                          (opt) =>
                            opt.value !== 1.1 &&
                            opt.value !== 2.1 &&
                            opt.value !== 3.1 &&
                            opt.value > 1.1 &&
                            opt.value < 4
                        )
                        .map(({ index, ...option }, key, arr) => {
                          return (
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }} key={key}>
                              <div style={{ flexGrow: 1 }}>
                                <Text
                                  isEmbedded
                                  label={'Label'}
                                  value={option.label}
                                  onChange={(e) => onOptionChange.setLabel(e, index)}
                                />
                              </div>
                              <div style={{ flexGrow: 1 }}>
                                {type === 'String' || type === 'Strings' ? (
                                  <Text
                                    isEmbedded
                                    label={'Value'}
                                    value={option.value}
                                    onChange={(e) => onOptionChange.setValueStr(e, index)}
                                  />
                                ) : (
                                  <Number
                                    isEmbedded
                                    type={type === 'Number' || type === 'Numbers' ? 'Int' : 'Float'}
                                    label={'Value'}
                                    value={option.value}
                                    onChange={(e) => onOptionChange.setValueNum(e, index)}
                                  />
                                )}
                              </div>
                              <div style={{ flexGrow: 1 }}>
                                <Field isEmbedded label={'Disabled'}>
                                  <Checkbox
                                    isEmbedded
                                    label={''}
                                    checked={option.disabled}
                                    onChange={(e) => onOptionChange.setDisabled(e, index)}
                                  />
                                </Field>
                              </div>
                              <IconButtonWrapper
                                color={'red'}
                                onClick={() => {
                                  dispatch(
                                    setRootSchemaProperty(props.id, `field.options`, [
                                      ...arr.slice(0, index),
                                      ...arr.slice(index + 1),
                                    ])
                                  );
                                }}
                              >
                                <Dismiss24Regular />
                              </IconButtonWrapper>
                            </div>
                          );
                        })}
                      <Button
                        onClick={() => {
                          if (def?.field?.options && Array.isArray(def.field.options)) {
                            dispatch(
                              setRootSchemaProperty(props.id, `field.options`, [
                                ...def.field.options,
                                { value: '', label: '' },
                              ])
                            );
                          }
                        }}
                      >
                        Add option
                      </Button>
                    </IndentField>
                  </Field>
                </>
              ) : (
                <IndentField color={'primary'}>
                  {def.field.options.map((option, index, arr) => {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                        <div style={{ flexGrow: 1 }}>
                          <Text
                            isEmbedded
                            label={'Label'}
                            value={option.label}
                            onChange={(e) => onOptionChange.setLabel(e, index)}
                          />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          {type === 'String' || type === 'Strings' ? (
                            <Text
                              isEmbedded
                              label={'Value'}
                              value={option.value}
                              onChange={(e) => onOptionChange.setValueStr(e, index)}
                            />
                          ) : (
                            <Number
                              isEmbedded
                              type={type === 'Number' || type === 'Numbers' ? 'Int' : 'Float'}
                              label={'Value'}
                              value={option.value}
                              onChange={(e) => onOptionChange.setValueNum(e, index)}
                            />
                          )}
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <Field isEmbedded label={'Disabled'}>
                            <Checkbox
                              isEmbedded
                              label={''}
                              checked={option.disabled}
                              onChange={(e) => onOptionChange.setDisabled(e, index)}
                            />
                          </Field>
                        </div>
                        <IconButtonWrapper
                          color={'red'}
                          onClick={() => {
                            dispatch(
                              setRootSchemaProperty(props.id, `field.options`, [
                                ...arr.slice(0, index),
                                ...arr.slice(index + 1),
                              ])
                            );
                          }}
                        >
                          <Dismiss24Regular />
                        </IconButtonWrapper>
                      </div>
                    );
                  })}

                  <Button
                    onClick={() => {
                      if (def?.field?.options && Array.isArray(def.field.options)) {
                        dispatch(
                          setRootSchemaProperty(props.id, `field.options`, [
                            ...def.field.options,
                            { value: '', label: '' },
                          ])
                        );
                      }
                    }}
                  >
                    Add option
                  </Button>
                </IndentField>
              )
            ) : null}
          </>
        ) : activeTab === 1 ? (
          <>
            {!isDocArray ? (
              <Checkbox
                isEmbedded
                label={'Make this field required'}
                description={
                  isReferenceOne
                    ? 'Prevent saving an entry if this field is not defined. This field will be disabled if you require it but do not set a default value.'
                    : 'Prevent saving an entry if this field is not defined. Empty text fields are considered to be defined.'
                }
                checked={def?.required === true}
                onChange={(e) => dispatch(setRootSchemaProperty(props.id, `required`, e.currentTarget.checked))}
              />
            ) : null}
            {!isBranching && !isInBranch && !isDocArray && !isStageField ? (
              <Checkbox
                isEmbedded
                label={'Set this field as unique'}
                description={'Prevent saving an entry if this field is not unique.'}
                checked={def?.unique === true}
                onChange={(e) => dispatch(setRootSchemaProperty(props.id, `unique`, e.currentTarget.checked))}
              />
            ) : null}
            {!isBranching && !isInBranch && !isDocArray && !isMarkdown && !isStageField ? (
              <Checkbox
                isEmbedded
                label={'Require this field to match a specific pattern'}
                description={'Only accept the specified regular expression.'}
                checked={!!def?.rule}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    dispatch(
                      setRootSchemaProperty(props.id, `rule`, {
                        regexp: { pattern: '', flags: '' },
                        message: '',
                      })
                    );
                  } else {
                    dispatch(setRootSchemaProperty(props.id, `rule`, false));
                  }
                }}
              />
            ) : null}
            {!!def?.rule ? (
              <IndentField color={'primary'}>
                <Text
                  isEmbedded
                  label={'Pattern'}
                  value={def.rule.regexp.pattern}
                  onChange={(e) =>
                    dispatch(setRootSchemaProperty(props.id, `rule.regexp.pattern`, e.currentTarget.value))
                  }
                />
                <Text
                  isEmbedded
                  label={'Flags'}
                  value={def.rule.regexp.flags}
                  onChange={(e) =>
                    dispatch(setRootSchemaProperty(props.id, `rule.regexp.flags`, e.currentTarget.value))
                  }
                />
                <Text
                  isEmbedded
                  label={'Custom error message'}
                  value={def.rule.message}
                  onChange={(e) =>
                    dispatch(setRootSchemaProperty(props.id, `rule.message`, e.currentTarget.value))
                  }
                />
              </IndentField>
            ) : null}
          </>
        ) : activeTab === 2 ? (
          <>
            {!isBranching && !isInBranch && !isDocArray && !isInDocArray ? (
              <Field isEmbedded label={'Search and sort'}>
                <>
                  {type === 'String' || type === 'Strings' ? (
                    <Checkbox
                      isEmbedded
                      label={'Index this field for search'}
                      checked={def?.textSearch === true}
                      onChange={(e) =>
                        dispatch(setRootSchemaProperty(props.id, `textSearch`, e.currentTarget.checked))
                      }
                    />
                  ) : null}
                  <Checkbox
                    isEmbedded
                    label={'Allow sorting this field in ascending or descending order in table views'}
                    checked={def?.column?.sortable === true}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, `column.sortable`, e.currentTarget.checked))
                    }
                  />
                </>
              </Field>
            ) : null}
            <Field isEmbedded label={'Visibility'}>
              <>
                {!isBranching && !isStageField ? (
                  <>
                    <Checkbox
                      isEmbedded
                      label={'Hide from document editor'}
                      checked={def?.field?.hidden === true || def?.field?.hidden === 'publish-only'}
                      onChange={(e) =>
                        dispatch(setRootSchemaProperty(props.id, `field.hidden`, e.currentTarget.checked))
                      }
                    />
                    {def?.field?.hidden === true || def?.field?.hidden === 'publish-only' ? (
                      <IndentField color={'primary'}>
                        <Checkbox
                          isEmbedded
                          label={'Show in publish prompt'}
                          checked={def?.field?.hidden === 'publish-only'}
                          onChange={(e) => {
                            if (e.currentTarget.checked) {
                              dispatch(setRootSchemaProperty(props.id, `field.hidden`, 'publish-only'));
                            } else {
                              dispatch(setRootSchemaProperty(props.id, `field.hidden`, true));
                            }
                          }}
                        />
                      </IndentField>
                    ) : null}
                  </>
                ) : null}
                {!isInBranch && !isDocArray && !isInDocArray ? (
                  <Checkbox
                    isEmbedded
                    label={'Hide from table views'}
                    checked={def?.column?.hidden === true}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, `column.hidden`, e.currentTarget.checked))
                    }
                  />
                ) : null}
                {!isBranching && !isDocArray && !isStageField ? (
                  <Checkbox
                    isEmbedded
                    label={'Make this field read only'}
                    checked={def?.modifiable === false}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, `modifiable`, !e.currentTarget.checked))
                    }
                  />
                ) : null}
              </>
            </Field>
            {!isBranching &&
            !isDocArray &&
            (type === 'String' ||
              type === 'Number' ||
              type === 'Int' ||
              type === 'Float' ||
              type === 'Boolean' ||
              type === 'Date' ||
              type === 'Reference' ||
              (isTypeTuple(def?.type) && type === 'ObjectId') ||
              type === 'Strings' ||
              type === 'Numbers' ||
              type === 'Ints' ||
              type === 'Floats' ||
              type === 'Booleans' ||
              (isTypeTuple(def?.type) && type === 'ObjectIds')) ? (
              <Field isEmbedded label={'Defaults'}>
                <>
                  <Checkbox
                    isEmbedded
                    label={'Use a default value'}
                    description={'Fill this field with the default value upon document creation.'}
                    checked={def?.default !== undefined}
                    onChange={(e) => {
                      if (!e.currentTarget.checked)
                        dispatch(setRootSchemaProperty(props.id, `default`, undefined));
                      else if (type === 'String') {
                        dispatch(setRootSchemaProperty(props.id, `default`, ''));
                      } else if (type === 'Number' || type === 'Int' || type === 'Float') {
                        dispatch(setRootSchemaProperty(props.id, `default`, 0));
                      } else if (type === 'Boolean') {
                        dispatch(setRootSchemaProperty(props.id, `default`, true));
                      } else if (type === 'Date') {
                        dispatch(setRootSchemaProperty(props.id, `default`, new Date().toISOString()));
                      } else if (type === 'ObjectId') {
                        dispatch(setRootSchemaProperty(props.id, `default`, null));
                      } else if (
                        type === 'Strings' ||
                        type === 'Numbers' ||
                        type === 'Floats' ||
                        type === 'Ints' ||
                        type === 'Booleans' ||
                        type === 'ObjectIds'
                      ) {
                        dispatch(setRootSchemaProperty(props.id, `default`, []));
                      }
                    }}
                  />
                  {def?.default !== undefined ? (
                    <IndentField color={'primary'}>
                      <>
                        {typeof def.default === 'string' && type === 'String' && def.field?.markdown ? (
                          <Code
                            isEmbedded
                            type={'md'}
                            label={'Default value'}
                            value={def.default}
                            onChange={(newValue) => {
                              if (newValue) {
                                dispatch(setRootSchemaProperty(props.id, `default`, newValue));
                              }
                            }}
                          />
                        ) : typeof def.default === 'string' && type === 'String' ? (
                          <Text
                            isEmbedded
                            label={'Default value'}
                            value={def.default}
                            onChange={(e) => {
                              dispatch(setRootSchemaProperty(props.id, `default`, e.currentTarget.value));
                            }}
                          />
                        ) : typeof def.default === 'number' && (type === 'Number' || type === 'Int') ? (
                          <Number
                            isEmbedded
                            type={'Int'}
                            label={'Default value'}
                            value={def.default}
                            onChange={(e) => {
                              dispatch(
                                setRootSchemaProperty(props.id, `default`, e.currentTarget.valueAsNumber)
                              );
                            }}
                          />
                        ) : isStageField ? (
                          <SelectOne
                            isEmbedded
                            label={'Default value'}
                            type={'Float'}
                            options={def?.field?.options}
                            value={(def?.field?.options as NumberOption[])?.find(
                              (opt) => opt.value === def.default
                            )}
                          />
                        ) : typeof def.default === 'number' && type === 'Float' ? (
                          <Number
                            isEmbedded
                            type={'Float'}
                            label={'Default value'}
                            value={def.default}
                            onChange={(e) => {
                              dispatch(
                                setRootSchemaProperty(props.id, `default`, e.currentTarget.valueAsNumber)
                              );
                            }}
                          />
                        ) : typeof def.default === 'boolean' && type === 'Boolean' ? (
                          <Checkbox
                            isEmbedded
                            label={'true'}
                            checked={def.default}
                            onChange={(e) => {
                              dispatch(setRootSchemaProperty(props.id, `default`, e.currentTarget.checked));
                            }}
                          />
                        ) : typeof def.default === 'string' && type === 'Date' ? (
                          <DateTime
                            isEmbedded
                            label={'Default value'}
                            value={def.default}
                            onChange={(date) => {
                              if (date) {
                                dispatch(setRootSchemaProperty(props.id, `default`, date.toUTC().toISO()));
                              }
                            }}
                          />
                        ) : Array.isArray(def.default) &&
                          (type === 'Strings' || type === 'Numbers' || type === 'Ints') ? (
                          <SelectMany
                            isEmbedded
                            type={type === 'Strings' ? 'String' : type === 'Numbers' ? 'Float' : 'Int'}
                            label={'Default values'}
                            values={def.default.map((value) => ({ value: `${value}`, label: `${value}` }))}
                            onChange={(values) => {
                              const newValues = values.map(({ value }) => value);
                              if (newValues !== undefined)
                                dispatch(setRootSchemaProperty(props.id, 'default', newValues));
                            }}
                          />
                        ) : isTypeTuple(def.type) &&
                          type === 'ObjectId' &&
                          (def.default === null || typeof def.default === 'string') ? (
                          // reference type
                          <ReferenceOne
                            isEmbedded
                            label={`Default ${camelToDashCase(
                              uncapitalize(pluralize(def.type[0].replace('[', '').replace(']', '')))
                            ).replace('-', '')}`}
                            value={def.default ? { _id: def.default } : null}
                            collection={def.type[0].replace('[', '').replace(']', '')}
                            reference={def.field?.reference}
                            onChange={(newValue) => {
                              if (newValue) {
                                dispatch(setRootSchemaProperty(props.id, 'default', newValue._id));
                              }
                            }}
                          />
                        ) : Array.isArray(def.default) && isTypeTuple(def.type) && type === 'ObjectIds' ? (
                          // reference type
                          <ReferenceMany
                            isEmbedded
                            label={`Default ${camelToDashCase(
                              uncapitalize(pluralize(def.type[0].replace('[', '').replace(']', '')))
                            ).replace('-', '')}`}
                            values={def.default.map((value) => ({ _id: `${value}` }))}
                            collection={pluralize.singular(def.type[0].replace('[', '').replace(']', ''))}
                            reference={def.field?.reference}
                            onChange={(newValues) => {
                              if (newValues !== undefined) {
                                dispatch(
                                  setRootSchemaProperty(
                                    props.id,
                                    'default',
                                    newValues.map((val) => val._id)
                                  )
                                );
                              }
                            }}
                          />
                        ) : null}
                      </>
                    </IndentField>
                  ) : null}
                </>
              </Field>
            ) : null}
            {!isInBranch && !isDocArray && !isInDocArray ? (
              <Field isEmbedded label={'Setter'}>
                <>
                  <Checkbox
                    isEmbedded
                    label={'Use a setter'}
                    description={'Set the value of this field when a condition is met.'}
                    checked={!!def?.setter}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, `setter`, e.currentTarget.checked))
                    }
                  />
                  {!!def?.setter ? (
                    <IndentField color={'primary'}>
                      <Code
                        isEmbedded
                        type={'json'}
                        label={'Condition'}
                        value={JSON.stringify(def.setter.condition, null, 2)}
                        onChange={(value) => {
                          if (value)
                            dispatch(setRootSchemaProperty(props.id, `setter.condition`, JSON.parse(value)));
                        }}
                      />
                      <Code
                        type={'json'}
                        isEmbedded
                        label={'Value'}
                        value={JSON.stringify(def.setter.value, null, 2)}
                        onChange={(value) => {
                          if (value)
                            dispatch(setRootSchemaProperty(props.id, `setter.value`, JSON.parse(value)));
                        }}
                      />
                    </IndentField>
                  ) : null}
                </>
              </Field>
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
              {!isStageField ? (
                <div style={{ flexGrow: 1 }}>
                  <Number
                    isEmbedded
                    type={'Int'}
                    label={'Field order'}
                    value={def?.field?.order}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, `field.order`, e.currentTarget.value))
                    }
                  />
                </div>
              ) : null}
              {!isInBranch && !isDocArray && !isInDocArray ? (
                <div style={{ flexGrow: 1 }}>
                  <Number
                    isEmbedded
                    type={'Int'}
                    label={'Column order'}
                    value={def?.column?.order}
                    onChange={(e) =>
                      dispatch(setRootSchemaProperty(props.id, `column.order`, e.currentTarget.value))
                    }
                  />
                </div>
              ) : null}
            </div>
            {!isInBranch && !isDocArray && !isInDocArray ? (
              <Number
                isEmbedded
                type={'Int'}
                label={'Column width'}
                value={def?.column?.width || 150}
                onChange={(e) =>
                  dispatch(setRootSchemaProperty(props.id, `column.width`, e.currentTarget.value))
                }
              />
            ) : null}
            {!isInBranch &&
            !isDocArray &&
            !isInDocArray &&
            !isMarkdown &&
            (type === 'String' ||
              type === 'Strings' ||
              type === 'Number' ||
              type === 'Numbers' ||
              type === 'Float' ||
              type === 'Floats') ? (
              <Checkbox
                isEmbedded
                label={'Style this field as chips in the table view'}
                checked={!!def?.column?.chips}
                onChange={(e) =>
                  dispatch(setRootSchemaProperty(props.id, `column.chips`, e.currentTarget.checked))
                }
              />
            ) : null}
            {!!def?.column?.chips ? (
              <IndentField color={'primary'}>
                <>
                  {(def.column.chips === true ? [] : def.column.chips).map((option, index, arr) => {
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
                          <Text
                            isEmbedded
                            label={'Label'}
                            value={option.label}
                            onChange={(e) =>
                              dispatch(
                                setRootSchemaProperty(
                                  props.id,
                                  `column.chips.${index}.label`,
                                  e.currentTarget.value
                                )
                              )
                            }
                          />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          {type === 'String' || type === 'Strings' ? (
                            <Text
                              isEmbedded
                              label={'Value'}
                              value={option.value}
                              onChange={(e) =>
                                dispatch(
                                  setRootSchemaProperty(
                                    props.id,
                                    `column.chips.${index}.value`,
                                    e.currentTarget.value
                                  )
                                )
                              }
                            />
                          ) : (
                            <Number
                              isEmbedded
                              type={type === 'Number' || type === 'Numbers' ? 'Int' : 'Float'}
                              label={'Value'}
                              value={option.value}
                              onChange={(e) =>
                                dispatch(
                                  setRootSchemaProperty(
                                    props.id,
                                    `column.chips.${index}.value`,
                                    e.currentTarget.value
                                  )
                                )
                              }
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
                            onChange={(e) => {
                              if (e?.value) {
                                dispatch(
                                  setRootSchemaProperty(props.id, `column.chips.${index}.color`, e.value)
                                );
                              }
                            }}
                          />
                        </div>
                        <IconButtonWrapper
                          color={'red'}
                          onClick={() => {
                            dispatch(
                              setRootSchemaProperty(props.id, `column.chips`, [
                                ...arr.slice(0, index),
                                ...arr.slice(index + 1),
                              ])
                            );
                          }}
                        >
                          <Dismiss24Regular />
                        </IconButtonWrapper>
                      </div>
                    );
                  })}

                  <Button
                    onClick={() => {
                      if (def?.column?.chips && Array.isArray(def.column.chips)) {
                        dispatch(
                          setRootSchemaProperty(props.id, `column.chips`, [
                            ...def.column.chips,
                            { value: '', label: '' },
                          ])
                        );
                      }
                      if (def?.column?.chips === true) {
                        dispatch(setRootSchemaProperty(props.id, `column.chips`, [{ value: '', label: '' }]));
                      }
                    }}
                  >
                    Add
                  </Button>
                </>
              </IndentField>
            ) : null}
          </>
        ) : isRichText ? (
          <>
            <Field
              isEmbedded
              label={'Features'}
              description={
                'Enable and disable editor features. ' +
                'By default, only plain text is supported. ' +
                'Disabling a feature will not remove existing cases of it ' +
                '(e.g. existing bold text will not dissapear if bold functionality is disabled.'
              }
            >
              <>
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Bold text'}
                  checked={!!def.field?.tiptap?.features?.bold}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.bold`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Italicized text'}
                  checked={!!def.field?.tiptap?.features?.italic}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.italic`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Text underline'}
                  checked={!!def.field?.tiptap?.features?.underline}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.underline`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Text strikethough'}
                  checked={!!def.field?.tiptap?.features?.strike}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.strike`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Code blocks and inline code'}
                  checked={!!def.field?.tiptap?.features?.code}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.code`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Bullet lists'}
                  checked={!!def.field?.tiptap?.features?.bulletList}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.bulletList`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Ordered lists'}
                  checked={!!def.field?.tiptap?.features?.orderedList}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.orderedList`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Text style picker (p, h2, h3, etc.)'}
                  checked={!!def.field?.tiptap?.features?.textStylePicker}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.textStylePicker`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Horizontal rules'}
                  checked={!!def.field?.tiptap?.features?.horizontalRule}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.horizontalRule`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Photo widgets'}
                  checked={!!def.field?.tiptap?.features?.widgets?.photoWidget}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.widgets.photoWidget`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Sweepwidget sweepstake widgets'}
                  checked={!!def.field?.tiptap?.features?.widgets?.sweepwidget}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.widgets.sweepwidget`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'YouTube embeds'}
                  checked={!!def.field?.tiptap?.features?.widgets?.youtube}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.widgets.youtube`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Hyperlinks'}
                  checked={!!def.field?.tiptap?.features?.link}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.link`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Comments'}
                  checked={!!def.field?.tiptap?.features?.comment}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.comment`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Track changes'}
                  checked={!!def.field?.tiptap?.features?.trackChanges}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.trackChanges`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Pull quotes (callout text)'}
                  checked={!!def.field?.tiptap?.features?.pullQuote}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.pullQuote`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Tables'}
                  checked={!!def.field?.tiptap?.features?.tables}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(props.id, `field.tiptap.features.tables`, e.currentTarget.checked)
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Font family picker'}
                  checked={!!def.field?.tiptap?.features?.fontFamilyPicker}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.fontFamilyPicker`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
                <Checkbox
                  isEmbedded
                  style={{ padding: '0 0 10px 0' }}
                  label={'Font size picker'}
                  checked={!!def.field?.tiptap?.features?.fontSizePicker}
                  onChange={(e) => {
                    dispatch(
                      setRootSchemaProperty(
                        props.id,
                        `field.tiptap.features.fontSizePicker`,
                        e.currentTarget.checked
                      )
                    );
                  }}
                />
              </>
            </Field>
            {def.field?.tiptap?.features?.fontFamilyPicker ? (
              <SelectMany
                isEmbedded
                label={'Permitted fonts'}
                type={'String'}
                values={(def.field?.tiptap?.features.fontFamilies || []).map(({ name, label }) => ({
                  value: name,
                  label: label || name,
                }))}
                onChange={(values) => {
                  const families = values.map(({ value, label }) => ({ name: value.toString(), label }));
                  dispatch(setRootSchemaProperty(props.id, `field.tiptap.features.fontFamilies`, families));
                }}
              />
            ) : null}
            {def.field?.tiptap?.features?.fontSizePicker ? (
              <SelectMany
                isEmbedded
                label={'Permitted font sizes'}
                type={'String'}
                values={(def.field?.tiptap?.features.fontSizes || []).map((value) => ({ value, label: value }))}
                onChange={(values) => {
                  const sizes = values.map(({ value, label }) => value.toString());
                  dispatch(setRootSchemaProperty(props.id, `field.tiptap.features.fontSizes`, sizes));
                }}
              />
            ) : null}
            <Text
              isEmbedded
              label={'Meta frame URL'}
              description={
                'Render this URL in an iFrame above the editor body. ' +
                'Field data is provided via <code>Window.postMessage()</code> ' +
                'and can be captured and rendered by adding a listener for messages. ' +
                'Include the <a href="https://github.com/davidjbradshaw/iframe-resizer">iframe-resizer</a> content script ' +
                'to allow the iframe to automatically resize to fit the content inside the iframe.'
              }
              value={def?.field?.tiptap?.metaFrame}
              onChange={(e) =>
                dispatch(setRootSchemaProperty(props.id, `field.tiptap.metaFrame`, e.currentTarget.value))
              }
            />
            <Code
              isEmbedded
              label={'Editor styles'}
              description={
                'Custom CSS styles that will be applied to the editor content. ' +
                'Nested selectors are supported. ' +
                'Use <code>.ProseMirror</code> as the root selector. ' +
                'Selectors not staring with <code>.ProseMirror</code> will be ignored.'
              }
              type={'less'}
              value={def?.field?.tiptap?.css || ''}
              onChange={(value) => dispatch(setRootSchemaProperty(props.id, `field.tiptap.css`, value))}
            />
            <Field
              isEmbedded
              label={'Data attribute fields'}
              description={
                'Add a data attribute to the <code>.ProseMirror</code> element ' +
                'with the value of the selected field. ' +
                'This can be used to apply different css based on the values of fields. ' +
                'Value lengths must be less than 25 characters.'
              }
            >
              <>
                {deconstructedSchema
                  .map(([key, _def]): [typeof key, typeof _def, MongooseSchemaType | 'DocArray'] => {
                    const type: MongooseSchemaType | 'DocArray' = isTypeTuple(_def.type)
                      ? _def.type[1]
                      : _def.type;
                    return [key, _def, type];
                  })
                  .filter(([key, _def, type]) => type === 'String' || type === 'Float' || type === 'Number')
                  .map(([key, _def, type], index) => (
                    <Checkbox
                      isEmbedded
                      label={_def.field?.label || key}
                      key={index}
                      style={{ padding: 0, paddingBottom: 10 }}
                      checked={def.field?.tiptap?.pmAttrFields?.includes(key) || false}
                      onChange={(e) => {
                        let pmAttrFields: string[] = [...(def.field?.tiptap?.pmAttrFields || [])];

                        if (e.currentTarget.checked) pmAttrFields.push(key);
                        else pmAttrFields = pmAttrFields.filter((fieldKey) => fieldKey !== key);

                        dispatch(setRootSchemaProperty(props.id, `field.tiptap.pmAttrFields`, pmAttrFields));
                      }}
                    />
                  ))}
              </>
            </Field>
            <SelectOne
              isEmbedded
              label={'Not editible prosemirror JSON'}
              description={
                'Select a boolean field that indicates if the data in this field ' +
                'is not prosemirror JSON (or at least should not be editable). ' +
                'This boolean field is usually not available for manipulation by ' +
                'content editors, and is usually set when importing data from a ' +
                'different database that stored body content as HTML or Markdown.'
              }
              type={'String'}
              options={[
                def?.field?.tiptap?.isHTMLkey ? { label: 'Clear value', value: '__unset' } : null,
                ...deconstructedSchema
                  .map(([key, _def]): [typeof key, typeof _def, MongooseSchemaType | 'DocArray'] => {
                    const type: MongooseSchemaType | 'DocArray' = isTypeTuple(_def.type)
                      ? _def.type[1]
                      : _def.type;
                    return [key, _def, type];
                  })
                  .filter(([key, _def, type]) => type === 'Boolean')
                  .map(([key, _def, type], index) => ({ value: key, label: _def.field?.label || key })),
              ].filter(notEmpty)}
              value={
                def?.field?.tiptap?.isHTMLkey
                  ? {
                      value: def.field.tiptap.isHTMLkey,
                      label:
                        deconstructedSchema.find(([key]) => key === def.field?.tiptap?.isHTMLkey)?.[1]?.field
                          ?.label || def.field.tiptap.isHTMLkey,
                    }
                  : { label: '', value: '__unset' }
              }
              onChange={(value) => {
                if (value) {
                  if (value.value === '__unset') {
                    dispatch(setRootSchemaProperty(props.id, `field.tiptap.isHTMLkey`, undefined));
                  } else {
                    dispatch(setRootSchemaProperty(props.id, `field.tiptap.isHTMLkey`, value.value));
                  }
                }
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
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

const IconButtonWrapper = styled.span<{ color: colorType; disabled?: boolean }>`
  ${({ color, theme, disabled }) =>
    buttonEffect(color, theme.mode === 'light' ? 700 : 300, theme, disabled, { base: 'transparent' })}
  border: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  width: 34px;
  min-height: 36px;
  margin: 0 1px 0 0;
  border-left: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

export { EditSchemaDef };
