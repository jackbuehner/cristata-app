import { getLabelTypes } from './getLabelTypes';

/**
 * Returns whether an array of typed labels includes the provided types.
 */
function includesTypes(labels: string[], includes: string[]) {
  const types = ['', ...getLabelTypes(labels)];

  // check that no type is in the includes array
  const isTypeInArray = !types.every((type) => !includes.includes(type));
  return isTypeInArray;
}

export { includesTypes };
