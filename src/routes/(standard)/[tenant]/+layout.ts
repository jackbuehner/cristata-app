import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import { setAuthProvider, setName, setObjectId, setOtherUsers } from '../../../redux/slices/authUserSlice';
import { persistor, store } from '../../../redux/store';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load = (async ({ parent, params, url }) => {
  const { authUser } = await parent();
  const { tenant } = params;

  // switch tenants if the tenant param does not match
  // the tenant for the user
  const isWrongTenant = tenant !== authUser.tenant;
  if (isWrongTenant) {
    await switchTenant(tenant, url);
  }

  // get/set the session id
  const sessionId = sessionStorage.getItem('sessionId') || Math.random().toString();
  sessionStorage.setItem('sessionId', sessionId);

  // store in redux (for react)
  store.dispatch(setAuthProvider(authUser.provider));
  store.dispatch(setName(authUser.name));
  store.dispatch(setObjectId(authUser._id.toHexString()));
  store.dispatch(setOtherUsers(authUser.otherUsers.map((ou) => ({ ...ou, _id: ou._id.toHexString() }))));

  return { sessionId };
}) satisfies LayoutLoad;

async function switchTenant(tenant: string, currentLocation: URL) {
  // clear cached data
  await persistor.purge(); // clear persisted redux store
  // await client.clearStore(); // clear persisted apollo data
  window.localStorage.removeItem('apollo-cache-persist'); // clear persisted apollo data

  // redirect
  const url = new URL(`${import.meta.env.VITE_API_PROTOCOL}//${import.meta.env.VITE_API_BASE_URL}`);
  url.pathname = `/auth/switch/${tenant}`;
  url.searchParams.set('continue', '1'); // allow the login page to automatically login (if available)
  url.searchParams.set(
    'return',
    currentLocation.origin + `/${tenant}/` + currentLocation.pathname.split('/').slice(2).join('/')
  );
  if (browser) goto(url.href);
  else throw redirect(307, url.href);
}
