import { query } from '$graphql/query';
import { uncapitalize } from '@jackbuehner/cristata-utils';
import { gql } from 'graphql-tag';
import mongoose from 'mongoose';

type UnpopulatedValue = { _id: string; label?: string; [key: string]: unknown };
type PopulatedValue = { _id: string; label: string; [key: string]: unknown };

async function populateReferenceValues(
  tenant: string,
  values: UnpopulatedValue[],
  collection: string,
  fields?: { _id?: string; name?: string }
): Promise<PopulatedValue[]> {
  return await Promise.all(
    values.map(async ({ _id, label }): Promise<PopulatedValue> => {
      if (label !== undefined) {
        return { _id, label };
      } else {
        return { _id, label: await getMissingLabel(tenant, _id, collection, fields) };
      }
    })
  );
}

async function getMissingLabel(
  tenant: string,
  _id: string,
  collection: string,
  fields?: { _id?: string; name?: string }
): Promise<string> {
  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) return _id;
    const res = await query<{ result?: { name?: string } }>({
      fetch,
      tenant,
      query: gql`{
        result: ${uncapitalize(collection)}(_id: "${_id}") {
          name: ${fields?.name || 'name'}
        }
      }`,
      useCache: false,
    });
    return res?.data?.result?.name || _id;
  } catch (error) {
    console.error(error);
    return _id;
  }
}

export { populateReferenceValues };
