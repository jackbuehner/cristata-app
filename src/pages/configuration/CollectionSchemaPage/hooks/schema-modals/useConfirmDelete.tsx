/* eslint-disable react-hooks/rules-of-hooks */
import { set as setProperty } from '$utils/objectPath';
import { useDispatch } from 'react-redux';
import { useWindowModal } from '../../../../../hooks/useWindowModal';
import { useAppSelector } from '../../../../../redux/hooks';
import { setRootSchemaDef } from '../../../../../redux/slices/collectionSlice';

interface UseConfirmDeleteProps {
  id: string;
}

function useConfirmDelete(props: UseConfirmDeleteProps): [React.ReactNode, () => void, () => void] {
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const state = useAppSelector(({ collectionConfig }) => collectionConfig);
    const dispatch = useDispatch();

    return {
      title: `Delete field?`,
      windowOptions: { name: `deleteSchemaField_${props.id}`, width: 370, height: 180 },
      text: 'All data in this field will be lost once you click Save.',
      continueButton: {
        text: 'Yes, stage this field for deletion',
        color: 'red',
        disabled: state.collection?.schemaDef === undefined,
        onClick: () => {
          if (state.collection?.schemaDef) {
            const copy = JSON.parse(JSON.stringify(state.collection.schemaDef));
            setProperty(copy, props.id, undefined);
            dispatch(setRootSchemaDef(copy));
            return true;
          }
          return false;
        },
      },
    };
  }, []);

  return [Window, showModal, hideModal];
}

export { useConfirmDelete };
