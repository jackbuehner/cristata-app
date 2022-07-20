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
import { getFieldTypes } from '../../tabs/getFieldTypes';
import { icons } from '../../tabs/SchemaCard';
import { EditSchemaDef } from './EditSchemaDef';

interface UseCreateSchemaDefProps {
  type: keyof typeof icons;
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
    useEffect(() => {
      setNewName('');
      setNewId('');
      setIsCreated(false);
      setAllowMultiple(false);
    }, deps);

    const fieldTypes = getFieldTypes(state.collection?.schemaDef || {});
    const idAlreadyExists = fieldTypes.find(([key]) => key === newId);

    const type = (() => {
      if (props.type === 'text') return 'String';
      if (props.type === 'boolean') return 'Boolean';
      if (props.type === 'datetime') return 'Date';
      if (props.type === 'decimal') return 'Float';
      if (props.type === 'number') return 'Number';
      if (props.type === 'objectid') return 'ObjectId';
      if (props.type === 'reference') return 'Reference';
      if (props.type === 'richtext') return 'String';
      return 'String';
    })();

    const referenceOptions = (collections || []).map((collection) => ({
      value: collection.name,
      label: collection.name,
    }));
    const [referenceType, setReferenceType] = useState<string>(referenceOptions[0]?.value || 'User');

    return {
      title: !isCreated ? `Create new field` : newName || newId,
      windowOptions: { name: `createSchemaField_${props.type}`, width: 370, height: 560 },
      styleString: `height: 600px; display: flex; flex-direction: column; > div[class*='-PlainModalContent'] { padding: 0; }`,
      cancelButton: !isCreated ? undefined : null,
      continueButton: !isCreated
        ? {
            text: 'Create',
            onClick: async () => {
              dispatch(setRootSchemaProperty(newId, 'id', newId));
              dispatch(setRootSchemaProperty(newId, 'field.label', newName));
              dispatch(setRootSchemaProperty(newId, 'modifiable', true));
              dispatch(setRootSchemaProperty(newId, 'multiple', allowMultiple));

              if (type === 'Reference' && allowMultiple) {
                dispatch(setRootSchemaProperty(newId, 'type', [`[${referenceType}]`, ['ObjectId']]));
              } else if (type === 'Reference' && !allowMultiple) {
                dispatch(setRootSchemaProperty(newId, 'type', [referenceType, 'ObjectId']));
              } else if (allowMultiple) {
                dispatch(setRootSchemaProperty(newId, 'type', [type]));
              } else if (!allowMultiple) {
                dispatch(setRootSchemaProperty(newId, 'type', type));
              }

              setIsCreated(true);
              return false;
            },
            disabled:
              !newId ||
              !newName ||
              !state.collection ||
              !!idAlreadyExists ||
              (type === 'Reference' && !referenceType),
          }
        : { text: 'Close' },
      children: !isCreated ? (
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
          <Text
            isEmbedded
            label={'API ID'}
            description={
              idAlreadyExists
                ? `<div style="color: ${theme.color.danger[800]}">ID already exists</div>`
                : undefined
            }
            value={newId}
            onChange={(e) => {
              setNewId(slugify(e.currentTarget.value, ''));
            }}
          />
          {props.type === 'text' ||
          props.type === 'number' ||
          props.type === 'decimal' ||
          props.type === 'reference' ? (
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
          {type === 'Reference' ? (
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
        <EditSchemaDef id={newId} setName={setNewName} />
      ),
    };
  }, [...deps]);

  return [Window, showModal, hideModal];
}

export { useCreateSchemaDef };
