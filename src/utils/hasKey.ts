/* eslint-disable @typescript-eslint/ban-types */

/**
 * Whether a given object has a given key.
 */
function hasKey<K extends string>(object: object, key: K): object is { [key in K]: unknown } {
  return object !== undefined && object !== null && typeof object === 'object' && key in object;
}

export { hasKey };
