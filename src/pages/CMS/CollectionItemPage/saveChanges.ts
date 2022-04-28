import { ApolloClient, ApolloError, gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../redux/hooks';
import { CmsItemState, setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { uncapitalize } from '../../../utils/uncapitalize';

/**
 * Save changes to the database.
 *
 * @returns true if successful; false if error
 */
async function saveChanges(
  client: ApolloClient<object>,
  collectionName: string,
  itemId: string,
  data: { dispatch: ReturnType<typeof useAppDispatch>; state: CmsItemState; refetch: () => void },
  extraData: { [key: string]: any } = {},
  permissionsOnly: boolean = false,
  idKey = '_id'
): Promise<boolean> {
  if (collectionName && itemId) {
    data.dispatch(setIsLoading(true));

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

    // modify the item in the database
    const config = {
      mutation: MODIFY_ITEM(
        itemId,
        permissionsOnly
          ? data.state.unsavedPermissions
          : { ...data.state.unsavedFields, ...data.state.tipTapFields, ...extraData }
      ),
    };
    return await client
      .mutate(config)
      .then(() => {
        data.dispatch(setIsLoading(false));
      })
      .then(() => {
        toast.success(`Changes successfully saved.`);
        data.refetch();
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
