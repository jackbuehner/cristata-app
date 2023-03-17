/**
 * Converts array elements to a string
 */
export function stringifyArray(arr: (string | 0)[]): string[] {
  return arr.map((value) => `${value}`);
}
