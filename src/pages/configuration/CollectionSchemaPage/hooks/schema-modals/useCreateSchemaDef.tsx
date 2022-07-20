/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useTheme } from '@emotion/react';
import { DependencyList, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Text } from '../../../../../components/ContentField';
import { useWindowModal } from '../../../../../hooks/useWindowModal';
import { useAppSelector } from '../../../../../redux/hooks';
import { setRootSchemaProperty } from '../../../../../redux/slices/collectionSlice';
import { slugify } from '../../../../../utils/slugify';
import { getFieldTypes } from '../../tabs/getFieldTypes';
import { icons } from '../../tabs/SchemaCard';

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
    const state = useAppSelector(({ collectionConfig }) => collectionConfig);
    const dispatch = useDispatch();

    const [newId, setNewId] = useState<string>('');
    const [newName, setNewName] = useState<string>('');
    useEffect(() => {
      setNewName('');
      setNewId('');
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
      if (props.type === 'reference') return 'String';
      if (props.type === 'richtext') return 'String';
      return 'String';
    })();

    return {
      title: `Create new field`,
      windowOptions: { name: `createSchemaField_${props.type}`, width: 370, height: 560 },
      styleString: `height: 600px; display: flex; flex-direction: column; > div[class*='-PlainModalContent'] { padding: 0; }`,
      continueButton: {
        text: 'Next',
        onClick: async () => {
          dispatch(setRootSchemaProperty(newId, 'id', newId));
          dispatch(setRootSchemaProperty(newId, 'field.label', newName));
          dispatch(setRootSchemaProperty(newId, 'type', type));
          return true;
        },
        disabled: !newId || !newName || !state.collection || !!idAlreadyExists,
      },
      children: (
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
        </div>
      ),
    };
  }, [...deps]);

  return [Window, showModal, hideModal];
}

export { useCreateSchemaDef };
