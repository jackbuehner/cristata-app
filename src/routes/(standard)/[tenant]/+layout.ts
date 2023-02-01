import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import {
  BasicProfileMe,
  GlobalConfig,
  TeamsList,
  UsersList,
  type BasicProfileMeQuery,
  type GlobalConfigQuery,
  type TeamsListQuery,
  type TeamsListQueryVariables,
  type UsersListQuery,
  type UsersListQueryVariables,
} from '$graphql/graphql';
import { query, queryWithStore } from '$graphql/query';
import { notEmpty } from '$utils/notEmpty';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { setAuthProvider, setName, setObjectId, setOtherUsers } from '../../../redux/slices/authUserSlice';
import { persistor, store } from '../../../redux/store';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load = (async ({ parent, params, url, fetch }) => {
  const { authUser } = await parent();
  const { tenant } = params;

  // switch tenants if the tenant param does not match
  // the tenant for the user
  const isWrongTenant = tenant !== authUser.tenant;
  if (isWrongTenant) {
    await switchTenant(tenant, url);
  }

  // get/set the session id
  const sessionId = (() => {
    if (browser) {
      const id = sessionStorage.getItem('sessionId') || Math.random().toString();
      sessionStorage?.setItem('sessionId', id);
      return id;
    }
    return Math.random().toString();
  })();

  // store auth user in redux (for react)
  store.dispatch(setAuthProvider(authUser.provider));
  store.dispatch(setName(authUser.name));
  store.dispatch(setObjectId(authUser._id.toHexString()));
  store.dispatch(setOtherUsers(authUser.otherUsers.map((ou) => ({ ...ou, _id: ou._id.toHexString() }))));

  // get the configuration
  const config = await query<GlobalConfigQuery>({
    fetch,
    tenant: authUser.tenant,
    query: GlobalConfig,
    useCache: true,
  });

  // get the current user basic profile
  const me = await query<BasicProfileMeQuery>({
    fetch,
    tenant: authUser.tenant,
    query: BasicProfileMe,
    useCache: true,
  });

  // get the list of all users
  const basicProfiles = await queryWithStore<UsersListQuery, UsersListQueryVariables>({
    fetch,
    tenant: authUser.tenant,
    query: UsersList,
    useCache: true,
    persistCache: 900000, // 15 minutes
    fetchNextPages: true,
    skip: browser && !!window?.name, // don't get the list if it is a popup window
    variables: { page: 1, limit: 100 },
  });

  // get the list of all teams
  const basicTeams = await queryWithStore<TeamsListQuery, TeamsListQueryVariables>({
    fetch,
    tenant: authUser.tenant,
    query: TeamsList,
    useCache: true,
    persistCache: 900000, // 15 minutes
    fetchNextPages: true,
    skip: browser && !!window?.name, // don't get the list if it is a popup window
    variables: { page: 1, limit: 100 },
  });

  return {
    sessionId,
    configuration: config?.data?.configuration,
    me: me?.data?.user,
    basicProfiles,
    basicTeams,
  };
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
