import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent, url }) => {
  const { authUser } = await parent();
  throw redirect(307, `${url.href}/${authUser._id}`);
}) satisfies PageLoad;
