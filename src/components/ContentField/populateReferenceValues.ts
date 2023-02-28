import type { ApolloClient } from '@apollo/client';
import { gql } from 'graphql-tag';
import mongoose from 'mongoose';
import { uncapitalize } from '../../utils/uncapitalize';

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string };

async function populateReferenceValues(
  client: ApolloClient<object>,
  values: UnpopulatedValue[],
  collection: string,
  fields?: { _id?: string; name?: string }
): Promise<PopulatedValue[]> {
  return await Promise.all(
    values.map(async ({ _id, label }): Promise<PopulatedValue> => {
      if (label !== undefined) {
        return { _id, label };
      } else {
        return { _id, label: await getMissingLabel(client, _id, collection, fields) };
      }
    })
  );
}

async function getMissingLabel(
  client: ApolloClient<object>,
  _id: string,
  collection: string,
  fields?: { _id?: string; name?: string }
): Promise<string> {
  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) return _id;
    const res = await client.query<{ result: { name: string } }>({
      query: gql`{
        result: ${uncapitalize(collection)}(_id: "${_id}") {
          name: ${fields?.name || 'name'}
        }
      }`,
      fetchPolicy: 'network-only',
    });
    return res.data?.result.name || _id;
  } catch (error) {
    console.error(error);
    return _id;
  }
}

export { populateReferenceValues };
