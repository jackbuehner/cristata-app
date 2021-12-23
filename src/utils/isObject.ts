/**
 * Whether the input is an object.
 */
function isObject(toCheck: unknown): toCheck is Record<string, unknown> {
  if (Object.prototype.toString.call(toCheck) === '[object Object]') {
    return true;
  }
  return false;
}

export { isObject };
