/**
 * Gets the types from the labels in a select.
 *
 * For example, `['type::label']` will return `['type']`.
 *
 * Subtypes are not supported. Labels with more than one "::" will only return the
 * content before the first "::".
 *
 * @param labels array of labels
 */
function getLabelTypes(labels: string[]) {
  const types = [];

  for (let i = 0; i < labels.length; i++) {
    const [, type] = labels[i].split('::').slice(0, 2).reverse() as [string, string | undefined];
    if (type) types.push(type);
  }

  return Array.from(new Set([...types]));
}

export { getLabelTypes };
