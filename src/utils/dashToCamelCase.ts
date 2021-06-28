/**
 * Converts a string separated by dashes to camelCase.
 *
 * _Adapted from https://stackoverflow.com/a/10425344/9861747_
 */
function dashToCamelCase(str: string) {
  return str.toLowerCase().replace(/-(.)/g, (match, group1) => {
    return group1.toUpperCase();
  });
}

export { dashToCamelCase };
