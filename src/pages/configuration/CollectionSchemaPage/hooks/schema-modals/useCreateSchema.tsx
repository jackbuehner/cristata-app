/* eslint-disable react-hooks/rules-of-hooks */
import type { DocumentNode } from '@apollo/client';
import { gql, useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'svelte-preprocess-react/react-router';
import { Text } from '../../../../../components/ContentField';
import { useWindowModal } from '../../../../../hooks/useWindowModal';
import { capitalize } from '../../../../../utils/capitalize';
import { dashToCamelCase } from '../../../../../utils/dashToCamelCase';
import { slugify } from '../../../../../utils/slugify';

function useCreateSchema(collectionNames: string[]): [React.ReactNode, () => void, () => void] {
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const client = useApolloClient();
    const navigate = useNavigate();
    const [name, setName] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const tenant = location.pathname.split('/')[1];

    const nameAlreadyExists = collectionNames.some((colName) => colName === name);

    return {
      title: `Create new schema`,
      windowOptions: { name: `createSchema`, width: 370, height: 300 },
      isLoading: loading,
      continueButton: {
        text: 'Create',
        onClick: async () => {
          setLoading(true);
          return await client
            .mutate<SaveMutationType>({
              mutation: saveMutationString(name),
            })
            .finally(() => {
              setLoading(false);
              setName('');
              setDisplayName('');
            })
            .then(({ data }) => {
              if (data?.setRawConfigurationCollection) {
                navigate(`/${tenant}/configuration/Schema/${name}#0`);
                return true;
              }
              return false;
            })
            .catch((error) => {
              console.error(error);
              toast.error(`Failed to save. \n ${error.message}`);
              return false;
            });
        },
        disabled: nameAlreadyExists,
      },
      children: (
        <>
          <Text
            isEmbedded
            label={'Display name'}
            description={
              'The name of the schema as it appears within the Cristata interface. This can be changed later.'
            }
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.currentTarget.value);
              setName(capitalize(dashToCamelCase(slugify(e.currentTarget.value))));
            }}
          />
          <Text
            isEmbedded
            disabled
            label={'API name'}
            description={'The name of the schema in the API. This cannot be changed later.'}
            value={name}
            onChange={(e) => setName(capitalize(dashToCamelCase(slugify(e.currentTarget.value))))}
          />
          {nameAlreadyExists ? 'Schema name already exists. Choose a unique name.' : null}
        </>
      ),
    };
  }, []);

  return [Window, showModal, hideModal];
}

interface SaveMutationType {
  setRawConfigurationCollection?: string | null;
}

function saveMutationString(name: string): DocumentNode {
  return gql`
    mutation {
      setRawConfigurationCollection(name: "${name}")
    }
  `;
}

export { useCreateSchema };
