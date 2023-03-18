import { gotoSignIn } from '$utils/gotoSignIn';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
  await gotoSignIn(params.tenant + '/sign-out', undefined, `${url.origin}/${params.tenant}`);
  return {};
}) satisfies PageLoad;
