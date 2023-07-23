import { deepen } from '$utils/deepen';
import { isTypeTuple } from '@jackbuehner/cristata-generator-schema';
import { merge } from 'merge-anything';
import type { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';

function docDefsToQueryObjectCols(
  input: DeconstructedSchemaDefType[0],
  index: number,
  arr: DeconstructedSchemaDefType
): ReturnType<typeof deepen> {
  const [key, def] = input;

  const isSubDocArray = def.type === 'DocArray';
  const isObjectType = isTypeTuple(def.type);

  if (key === 'timestamps.published_at') {
    return deepen({ 'timestamps.published_at': true });
  }

  if (isObjectType && def.column?.hidden !== true) {
    // if there is a reference definition, use the fields in the def
    if (def.field?.reference) {
      return merge(
        deepen({ [key + '.' + (def.field.reference.fields?._id || '_id')]: true }),
        deepen({ [key + '.' + (def.field.reference.fields?.name || 'name')]: true }),

        // get the fields that are forced by the config
        ...(def.field.reference.forceLoadFields || []).map((field) => deepen({ [key + '.' + field]: true }))
      );
    }

    // otherwise, just get the id
    return deepen({ [key + '._id']: true });
  }

  if (isSubDocArray) {
    return merge<Record<string, never>, Record<string, never>[]>(
      {},
      ...def.docs.map(([key, def], index, arr) => {
        return docDefsToQueryObjectCols([key, def], index, arr);
      })
    );
  }

  // only get the field if it is used in the table
  if (def.column?.hidden !== true && !key.includes('#')) {
    return deepen({ [key]: true });
  }

  return deepen({ _id: true });
}

export { docDefsToQueryObjectCols };
