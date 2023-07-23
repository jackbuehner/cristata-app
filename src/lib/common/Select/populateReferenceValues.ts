import { query } from '$graphql/query';
import { uncapitalize } from '@jackbuehner/cristata-utils';
import { gql } from 'graphql-tag';
import mongoose from 'mongoose';

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string; [key: string]: unknown };

async function populateReferenceValues(
  tenant: string,
  values: UnpopulatedValue[],
  collection: string,
  fields?: { _id?: string; name?: string },
  forceLoadFields?: string[]
): Promise<PopulatedValue[]> {
  return await Promise.all(
    values.map(async (value): Promise<PopulatedValue> => {
      const valueKeys = Object.keys(value);
      const forcedKeys = ['_id', 'label', ...(forceLoadFields || [])];
      const hasEveryKey = forcedKeys.every((forcedKey) => valueKeys.includes(forcedKey));

      if (hasEveryKey) {
        return { ...value, label: `${value.label}` };
      } else {
        return {
          _id: value._id,
          ...(await getMissingLabelAnyForcedFields(tenant, value._id, collection, fields, forceLoadFields)),
        };
      }
    })
  );
}

async function getMissingLabelAnyForcedFields(
  tenant: string,
  _id: string,
  collection: string,
  fields?: { _id?: string; name?: string },
  forceLoadFields?: string[]
): Promise<Record<string, unknown> & { label: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) return { label: _id };

    const forcedKeys = [...(forceLoadFields || [])];
    const res = await query<{ result?: { __label?: string; [key: string]: unknown } }>({
      fetch,
      tenant,
      query: gql`{
        result: ${uncapitalize(collection)}(_id: "${_id}") {
          __label: ${fields?.name || 'name'}
          ${forcedKeys.join(', ')}
        }
      }`,
      useCache: false,
    });

    const { __label = _id, ...rest } = res?.data?.result || {};
    return {
      ...rest,
      label: __label,
    };
  } catch (error) {
    console.error(error);
    return { label: _id };
  }
}

export { populateReferenceValues };
