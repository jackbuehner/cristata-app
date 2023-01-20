import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { authUser } = await parent();

  // redirect to tenant path based on the authenticated user
  throw redirect(307, `/${authUser.tenant}`);
}) satisfies PageLoad;
