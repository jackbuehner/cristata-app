/* eslint-disable react-hooks/rules-of-hooks */

import { get as getProperty } from 'object-path';
import { useState } from 'react';
import { Text } from '../../../../../components/ContentField';
import { useWindowModal } from '../../../../../hooks/useWindowModal';
import { useAppDispatch, useAppSelector } from '../../../../../redux/hooks';
import { setRootSchemaProperty } from '../../../../../redux/slices/collectionSlice';

interface UseCreateBranchProps {
  id: string;
  branches: { name: string; fields: React.ReactNode }[];
}

function useCreateBranch(props: UseCreateBranchProps): [React.ReactNode, () => void, () => void] {
  const dispatch = useAppDispatch();

  const createNewBranch = (name: string) => {
    dispatch(setRootSchemaProperty(`${props.id}.field.custom.${props.branches.length}`, `name`, name));
    dispatch(setRootSchemaProperty(`${props.id}.field.custom.${props.branches.length}`, `fields`, {}));
  };

  const [Window, showModal, hideModal] = useWindowModal(() => {
    const state = useAppSelector(({ collectionConfig }) => collectionConfig);

    const [branchName, setBranchName] = useState<string>('');

    const nameAlreadyExists = getProperty(state.collection?.schemaDef || {}, `${props.id}.field.custom`)?.some(
      (c: { name: string }) => c.name === branchName
    );

    return {
      title: `Create branch`,
      windowOptions: { name: `createBranch_${props.id}`, width: 370, height: 280 },
      continueButton: {
        text: 'Create',
        onClick: () => {
          createNewBranch(branchName);
          setBranchName('');
          return true;
        },
        disabled: nameAlreadyExists,
      },
      children: (
        <>
          <Text
            isEmbedded
            label={'Branch name'}
            description={
              'The branch is displayed to content editors when the name field and the branch name are the same.'
            }
            value={branchName}
            onChange={(e) => setBranchName(e.currentTarget.value)}
          />
          {nameAlreadyExists ? 'Name already exists. Choose a unique name.' : null}
        </>
      ),
    };
  }, []);

  return [Window, showModal, hideModal];
}
export { useCreateBranch };
