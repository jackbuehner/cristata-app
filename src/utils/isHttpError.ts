import type { HttpError } from '@sveltejs/kit';
import { hasKey } from './hasKey';

export function isHttpError(toCheck: unknown): toCheck is HttpError {
  return !!toCheck && typeof toCheck === 'object' && hasKey(toCheck, 'status') && hasKey(toCheck, 'body');
}
