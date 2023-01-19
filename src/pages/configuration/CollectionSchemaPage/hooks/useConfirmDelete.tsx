/* eslint-disable react-hooks/rules-of-hooks */
import { gql, useApolloClient } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWindowModal } from '../../../../hooks/useWindowModal';

interface UseConfirmDeleteProps {
  name: string | undefined;
}

function useConfirmDelete(props: UseConfirmDeleteProps): [React.ReactNode, () => void, () => void] {
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const client = useApolloClient();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const tenant = location.pathname.split('/')[1];

    return {
      title: `Delete collection?`,
      isLoading: loading,
      windowOptions: { name: `deleteSchema_${props.name}`, width: 370, height: 180 },
      text: 'Danger! All data in this collection will be lost. <br /><b><i>THIS CANNOT BE UNDONE.</i></b>',
      continueButton: {
        text: 'Yes, DELETE ALL DATA',
        color: 'red',
        disabled: props.name === undefined,
        onClick: async () => {
          if (props.name) {
            setLoading(true);
            return await client
              .mutate<DeleteMutationType>({
                mutation: deleteMutationString(props.name),
              })
              .finally(() => {
                setLoading(false);
              })
              .then(() => {
                navigate(`/${tenant}/configuration`);
                return true;
              })
              .catch((error) => {
                console.error(error);
                toast.error(`Failed to delete. \n ${error.message}`);
                return false;
              });
          }
          return false;
        },
      },
    };
  }, []);

  return [Window, showModal, hideModal];
}

interface DeleteMutationType {
  deleteCollection?: null;
}

function deleteMutationString(name: string): DocumentNode {
  return gql`
    mutation {
      deleteCollection(name: "${name}")
    }
  `;
}

export { useConfirmDelete };
