import { ApolloClient, ApolloError, gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { get as getProperty, set as setProperty } from 'object-path';
import { toast } from 'react-toastify';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { isObject } from '../../../utils/isObject';
import { uncapitalize } from '../../../utils/uncapitalize';

/**
 * Save changes to the database.
 *
 * @returns true if successful; false if error
 */
async function saveChanges(
  y: EntryY,
  client: ApolloClient<object>,
  collectionName: string,
  itemId: string,
  setIsLoading: (isLoading: boolean) => void,
  extraData: { [key: string]: any } = {},
  permissionsOnly: boolean = false,
  idKey = '_id'
): Promise<boolean> {
  const data = y.data;
  const unsavedFields = y.unsavedFields;
  const isUnsaved = unsavedFields.length > 0;

  if (collectionName && itemId && isUnsaved) {
    setIsLoading(true);

    // create the mutation
    const MODIFY_ITEM = (id: string, input: Record<string, unknown> | string) => {
      if (collectionName === 'Setting') input = JSON.stringify(input);
      return gql(
        jsonToGraphQLQuery({
          mutation: {
            [`${uncapitalize(collectionName)}Modify`]: {
              __args: {
                [idKey]: id,
                input: input,
              },
              _id: true,
            },
          },
        })
      );
    };

    // extract the fields that are unsaved
    const unsavedData: typeof data = {};
    unsavedFields.forEach((key) => {
      setProperty(unsavedData, key, getProperty(data, key));
    });

    // modify the item in the database
    const config = {
      mutation: MODIFY_ITEM(
        itemId,
        permissionsOnly && isObject(data.permissions) ? data.permissions : { ...unsavedData, ...extraData }
      ),
    };
    return await client
      .mutate(config)
      .then(() => {
        setIsLoading(false);
      })
      .then(() => {
        toast.success(`Changes successfully saved.`);
        return true;
      })
      .catch((error: ApolloError) => {
        console.error(error);
        const message = error.clientErrors?.[0]?.message || error.message;
        toast.error(`Failed to save changes. \n ${message}`);
        return false;
      });
  } else {
    toast.error(`Cannot save changes because the collection and document ID are unknown.`);
    return false;
  }
}

export { saveChanges };
