/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useTheme } from '@emotion/react';
import { DependencyList, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Checkbox, SelectOne, Text } from '../../../../../components/ContentField';
import { Field } from '../../../../../components/ContentField/Field';
import { useWindowModal } from '../../../../../hooks/useWindowModal';
import { useAppSelector } from '../../../../../redux/hooks';
import { setRootSchemaProperty } from '../../../../../redux/slices/collectionSlice';
import { slugify } from '../../../../../utils/slugify';
import { useGetCollections } from '../../../ConfigurationNavigation/useGetCollections';
import { SidebarSchemaCard } from '../../SidebarSchemaCard';
import { getFieldTypes } from '../../tabs/getFieldTypes';
import { icons } from '../../tabs/SchemaCard';
import { EditSchemaDef } from './EditSchemaDef';

interface UseCreateSchemaDefProps {
  type: keyof typeof icons;
  apiIdPrefix?: string;
}

function useCreateSchemaDef(
  props: UseCreateSchemaDefProps,
  deps: DependencyList
): [React.ReactNode, () => void, () => void] {
  // create the modal
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const theme = useTheme();
    const [collections] = useGetCollections();
    const state = useAppSelector(({ collectionConfig }) => collectionConfig);
    const dispatch = useDispatch();

    const [newId, setNewId] = useState<string>('');
    const [newName, setNewName] = useState<string>('');
    const [isCreated, setIsCreated] = useState<boolean>(false);
    const [allowMultiple, setAllowMultiple] = useState<boolean>(false);
    const [type, setType] = useState<keyof typeof icons>('unknown');
    useEffect(() => {
      setNewName('');
      setNewId('');
      setIsCreated(false);
      setAllowMultiple(false);
      setType('unknown');
    }, deps);
    useEffect(() => {
      setType(props.type);
    }, [props.type, ...deps]);

    const fieldTypes = getFieldTypes(state.collection?.schemaDef || {});
    const idAlreadyExists = fieldTypes.find(([key]) => key.split('.').some((k) => k === newId));

    const parsedType = (() => {
      if (type === 'text') return 'String';
      if (type === 'boolean') return 'Boolean';
      if (type === 'datetime') return 'Date';
      if (type === 'decimal') return 'Float';
      if (type === 'number') return 'Number';
      if (type === 'objectid') return 'ObjectId';
      if (type === 'reference') return 'Reference';
      if (type === 'richtext') return 'String';
      if (type === 'text-markdown') return 'String';
      if (type === 'branching') return 'JSON';
      if (type === 'docarray') return '[]';
      return 'String';
    })();

    useEffect(() => {
      if (type === 'richtext') {
        setNewId('body');
      }
    });

    const referenceOptions = (collections || []).map((collection) => ({
      value: collection.name,
      label: collection.name,
    }));
    const [referenceType, setReferenceType] = useState<string>(referenceOptions[0]?.value || 'User');

    return {
      title: type === 'unknown' ? `Choose field type` : !isCreated ? `Create new field` : newName || newId,
      windowOptions: { name: `createSchemaField_${type}`, width: 370, height: 560 },
      styleString: `height: 600px; display: flex; flex-direction: column; > div:first-of-type { padding: 0; }`,
      cancelButton: !isCreated ? undefined : null,
      continueButton: !isCreated
        ? {
            text: 'Create',
            onClick: async () => {
              const path = props.apiIdPrefix ? `${props.apiIdPrefix}.${newId}` : newId;

              if (parsedType !== '[]') {
                dispatch(setRootSchemaProperty(path, 'id', newId));
                dispatch(setRootSchemaProperty(path, 'field.label', newName));
                dispatch(setRootSchemaProperty(path, 'modifiable', true));
                dispatch(setRootSchemaProperty(path, 'multiple', allowMultiple));
              }

              if (parsedType === '[]') {
                dispatch(setRootSchemaProperty(path + '.0.#label', 'type', 'String'));
              } else if (parsedType === 'Reference' && allowMultiple) {
                dispatch(setRootSchemaProperty(path, 'type', [`[${referenceType}]`, ['ObjectId']]));
              } else if (parsedType === 'Reference' && !allowMultiple) {
                dispatch(setRootSchemaProperty(path, 'type', [referenceType, 'ObjectId']));
              } else if (allowMultiple) {
                dispatch(setRootSchemaProperty(path, 'type', [parsedType]));
              } else if (!allowMultiple) {
                dispatch(setRootSchemaProperty(path, 'type', parsedType));
              }

              if (parsedType === 'JSON' && type === 'branching') {
                dispatch(setRootSchemaProperty(path + '.field', 'custom', []));
              }

              if (type === 'text-markdown') {
                dispatch(setRootSchemaProperty(path + '.field', 'markdown', true));
              }

              setIsCreated(true);
              return false;
            },
            disabled:
              type === 'unknown' ||
              !newId ||
              !newName ||
              !state.collection ||
              !!idAlreadyExists ||
              (parsedType === 'Reference' && !referenceType),
          }
        : { text: 'Close' },
      children:
        type === 'unknown' ? (
          <div style={{ padding: '20px 24px' }}>
            <SidebarSchemaCard label={'Text'} icon={'text'} onClick={() => setType('text')} />
            <SidebarSchemaCard
              label={'Markdown'}
              icon={'text-markdown'}
              onClick={() => setType('text-markdown')}
            />
            <SidebarSchemaCard label={'Integer'} icon={'number'} onClick={() => setType('number')} />
            <SidebarSchemaCard label={'Float'} icon={'decimal'} onClick={() => setType('decimal')} />
            <SidebarSchemaCard label={'Boolean'} icon={'boolean'} onClick={() => setType('boolean')} />
            <SidebarSchemaCard label={'Reference'} icon={'reference'} onClick={() => setType('reference')} />
            <SidebarSchemaCard label={'Date and time'} icon={'datetime'} onClick={() => setType('datetime')} />
            {/* <SidebarSchemaCard label={'ObjectID'} icon={'objectid'} onClick={() => setType('objectid')} /> */}
          </div>
        ) : !isCreated ? (
          <div style={{ padding: '20px 24px' }}>
            <Text
              isEmbedded
              label={'Display name'}
              value={newName}
              onChange={(e) => {
                setNewName(e.currentTarget.value);
                setNewId(slugify(e.currentTarget.value, ''));
              }}
            />
            {type === 'richtext' ? null : (
              <Text
                isEmbedded
                label={'API ID'}
                description={
                  idAlreadyExists
                    ? `<div style="color: ${theme.color.danger[800]}">ID already exists</div>`
                    : undefined
                }
                value={props.apiIdPrefix ? `${props.apiIdPrefix}.${newId}` : newId}
                onChange={(e) => {
                  const prefix = props.apiIdPrefix
                    ? e.currentTarget.value.slice(0, props.apiIdPrefix.length + 1)
                    : '.';
                  const value = props.apiIdPrefix
                    ? e.currentTarget.value.slice(props.apiIdPrefix.length + 1)
                    : e.currentTarget.value;
                  if (prefix === `${props.apiIdPrefix}.`) {
                    setNewId(slugify(value, ''));
                  }
                }}
              />
            )}
            {type === 'text' || type === 'number' || type === 'decimal' || type === 'reference' ? (
              <Field isEmbedded label={'Validations'}>
                <>
                  <Checkbox
                    isEmbedded
                    label={'Allow multiple values'}
                    checked={allowMultiple}
                    onChange={(e) => {
                      setAllowMultiple(e.currentTarget.checked);
                    }}
                  />
                </>
              </Field>
            ) : null}
            {parsedType === 'Reference' ? (
              <SelectOne
                isEmbedded
                label={'Reference collection'}
                description={
                  'The options for this field will be populated by the documents in the reference collection.'
                }
                type={'String'}
                options={referenceOptions}
                value={{ label: referenceType, value: referenceType }}
                onChange={(value) => {
                  if (value && typeof value.value === 'string') setReferenceType(value.value);
                }}
              />
            ) : null}
          </div>
        ) : (
          <EditSchemaDef
            id={props.apiIdPrefix ? `${props.apiIdPrefix}.${newId}` : newId}
            setName={setNewName}
          />
        ),
    };
  }, [...deps]);

  return [Window, showModal, hideModal];
}

export { useCreateSchemaDef };
