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

function deepen(obj: Record<string, boolean | { __aliasFor: string } | string | number | string[]>) {
  const result: Record<string, never> = {};

  // For each object path (property key) in the object
  for (const objectPath in obj) {
    // Split path into component parts
    const parts = objectPath.split('.');

    // Create sub-objects along path as needed
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift() as string;
      target = target[part] = target[part] || {};
    }

    // Set value at end of path
    target[parts[0]] = obj[objectPath] as never;
  }

  return result;
}

export { deepen, docDefsToQueryObjectCols };
