import { ApolloError, gql } from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { get as getProperty, set as setProperty } from 'object-path';
import { toast } from 'react-toastify';
import { EntryY, IYSettingsMap } from '../../../components/Tiptap/hooks/useY';
import { isObject } from '../../../utils/isObject';
import { uncapitalize } from '../../../utils/uncapitalize';
import * as Y from 'yjs';

/**
 * Save changes to the database.
 *
 * @returns true if successful; false if error
 */
async function saveChanges(
  y: EntryY,
  setIsLoading: (isLoading: boolean) => void = y.setLoading,
  extraData: { [key: string]: any } = {},
  permissionsOnly: boolean = false,
  idKey = '_id'
): Promise<boolean> {
  const data = y.data;
  const unsavedFields = y.ydoc?.getArray<string>('__unsavedFields') || [];

  const ySettingsMap = y.ydoc?.getMap<IYSettingsMap>('__settings');
  const isAutosaveEnabled: boolean | undefined | null = ySettingsMap?.get('autosave');

  if (y.roomDetails.collection && y.roomDetails.id) {
    setIsLoading(true);

    // create the mutation
    const MODIFY_ITEM = (id: string, input: Record<string, unknown> | string) => {
      if (y.roomDetails.collection === 'Setting') input = JSON.stringify(input);
      return gql(
        jsonToGraphQLQuery({
          mutation: {
            [`${uncapitalize(y.roomDetails.collection)}Modify`]: {
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
      // exclude interal fields (start with __)
      if (key.indexOf('__') !== 0) {
        setProperty(unsavedData, key, getProperty(data, key));
      }
    });

    // encode the entire ydoc state to send to the server
    // so it can be merged with the server's ydoc
    if (y.ydoc) {
      try {
        let update: Uint8Array | undefined = undefined;
        let b64update: string | undefined = undefined;

        try {
          update = Y.encodeStateAsUpdate(y.ydoc);
        } catch (error) {
          console.error(error);
          setIsLoading(false);
          toast.error('The document on this device is corrupted and could not be saved');
        }

        if (update) {
          try {
            b64update = Buffer.from(update).toString('base64');
          } catch (error) {
            console.error(error);
            setIsLoading(false);
            toast.error('The document on this device could not be saved because it cannot be encoded');
          }
        }

        if (b64update) {
          unsavedData.yState = b64update;
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        toast.error('The document on this device has an unexpected error and cannot be saved');
      }
    }

    // modify the item in the database
    const config = {
      mutation: MODIFY_ITEM(
        y.roomDetails.id,
        permissionsOnly && isObject(data.permissions)
          ? { permissions: data.permissions }
          : { ...unsavedData, ...extraData }
      ),
    };
    return await y.client
      .mutate(config)
      .finally(() => {
        setIsLoading(false);
      })
      .then(() => {
        // hide toast when autosave is enabled
        if (!isAutosaveEnabled) toast.success(`Changes successfully saved.`);

        // clear unsaved fields array
        const __unsavedFields = y.ydoc?.getArray('__unsavedFields');
        __unsavedFields?.delete(0, __unsavedFields.toArray().length);

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
