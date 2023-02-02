import { gotoSignIn } from '$utils/gotoSignIn';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
  await gotoSignIn(undefined, url.origin);
}) satisfies PageLoad;
