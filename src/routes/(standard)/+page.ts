import { gotoSignIn } from '$utils/gotoSignIn';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  await gotoSignIn();
}) satisfies PageLoad;
