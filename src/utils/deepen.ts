/**
 * Deepens an object for use in constructing a graphql query
 */
export function deepen(obj: Record<string, boolean | { __aliasFor: string } | string | number | string[]>) {
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
