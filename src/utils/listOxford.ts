import { replaceLast } from './replaceLast';

function listOxford(arr: string[]) {
  if (arr.length === 2) return arr.join(' and ');
  return replaceLast(arr.join(', '), ', ', ', and ');
}

export { listOxford };
