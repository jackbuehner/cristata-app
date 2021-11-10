/**
 * Creates a complete key to be used when accessing flattened data
 * derived from the result of a collection GraphQL endpoint.
 * @param key the flattened field name from the
 * @param from the flattened parent field of `key` (if applicable)
 * @param subfield the flattened desired subfield of `key`  (if applicable)
 * @returns
 */
function buildFullKey(key: string, from?: string, subfield?: string) {
  let fullKey = '';
  if (from) fullKey += from + '.';
  fullKey += key;
  if (subfield) fullKey += '.' + subfield;
  return fullKey;
}

export { buildFullKey };
