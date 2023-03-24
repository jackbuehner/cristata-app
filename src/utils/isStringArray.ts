export function isStringArray(toCheck: unknown): toCheck is string[] {
  return Array.isArray(toCheck) && toCheck.every((elem) => typeof elem === 'string');
}
