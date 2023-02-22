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
import { query, queryWithStore, type GraphqlQueryReturn, type StoreReturnType } from '$graphql/query';
import { authCache, authUserValidator, type AuthUserType } from '$stores/authCache';
import { server } from '$utils/constants';
import { gotoSignIn } from '$utils/gotoSignIn';
import { isHttpError } from '$utils/isHttpError';
import { setSplashStatusText } from '$utils/setSplashStatusText';
import { error, redirect } from '@sveltejs/kit';
import type { Readable } from 'svelte/store';
import { get } from 'svelte/store';
import { setAuthProvider, setName, setObjectId, setOtherUsers } from '../../../redux/slices/authUserSlice';
import { persistor, store } from '../../../redux/store';
import type { LayoutData, LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load = (async ({ params, url, fetch }) => {
  const { tenant } = params;

  // get/set the session id
  const sessionId = (() => {
    if (browser) {
      const id = sessionStorage.getItem('sessionId') || Math.random().toString();
      sessionStorage?.setItem('sessionId', id);
      return id;
    }
    return Math.random().toString();
  })();

  // use the parent data instead of fetching fresh data
  const child = browser && !!window.name;
  if (child) {
    const parentLayoutData: LayoutDataType = JSON.parse(localStorage.getItem('share:layoutData') || '{}');

    await authUserValidator
      .parseAsync(parentLayoutData.authUser)
      .catch((err) => {
        throw error(500, err);
      })
      .then((authUser) => {
        authCache.set({ last: new Date(), authUser });
        parentLayoutData.authUser = authUser;
      });

    parentLayoutData.sessionId = sessionId;

    return parentLayoutData;
  }

  // check the authentication status of the current client
  let authUserPending = true;
  const authUser = (async (): Promise<AuthUserType> => {
    // use the cached auth
    if (get(authCache)) {
      const { authUser } = get(authCache);
      return authUser;
    }

    // otherwise, query the server for the user auth
    return await fetch(`${server.location}/auth`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        // redirect to the sign in page if not authenticated or authorized
        if (res.status === 401 || res.status === 403) {
          await gotoSignIn(tenant, url.origin);
        }

        // if the auth endpoint is missing
        if (res.status === 404) throw error(401, 'Failed to authenticate to the server.');

        // return the response json object
        return await res.json();
      })
      .catch(async (err) => {
        if (isHttpError(err)) throw err;
        if (err.message === 'Failed to fetch') throw error(401, 'Failed to connect to the server.');
        throw error(500, err);
      })
      .then(async (authResponse) => {
        const authUser = await authUserValidator.parseAsync(authResponse).catch((err) => {
          throw error(500, err);
        });

        authCache.set({ last: new Date(), authUser });
        return authUser;
      });
  })().then(async (authUser) => {
    authUserPending = false;

    // switch tenants if the tenant param does not match
    // the tenant for the user
    const isWrongTenant = tenant !== authUser.tenant;
    if (isWrongTenant) {
      await switchTenant(tenant, url);
    }

    // store auth user in redux (for react)
    store.dispatch(setAuthProvider(authUser.provider));
    store.dispatch(setName(authUser.name));
    store.dispatch(setObjectId(authUser._id.toHexString()));
    store.dispatch(setOtherUsers(authUser.otherUsers.map((ou) => ({ ...ou, _id: ou._id.toHexString() }))));

    return authUser;
  });

  // get the configuration
  let configPending = true;
  const config = query<GlobalConfigQuery>({
    fetch,
    tenant,
    query: GlobalConfig,
    useCache: true,
  }).finally(() => {
    configPending = false;
    showStatus();
  });

  // get the current user basic profile
  let mePending = true;
  const me = query<BasicProfileMeQuery>({
    fetch,
    tenant,
    query: BasicProfileMe,
    useCache: true,
  }).finally(() => {
    mePending = false;
    showStatus();
  });

  // get the list of all users
  let profilesPending = true;
  const basicProfiles = queryWithStore<UsersListQuery, UsersListQueryVariables>({
    fetch,
    tenant,
    query: UsersList,
    useCache: true,
    persistCache: 900000, // 15 minutes
    fetchNextPages: true,
    skip: browser && !!window?.name, // don't get the list if it is a popup window
    variables: { page: 1, limit: 100 },
  }).finally(() => {
    profilesPending = false;
    showStatus();
  });

  // get the list of all teams
  let basicTeamsPending = true;
  const basicTeams = queryWithStore<TeamsListQuery, TeamsListQueryVariables>({
    fetch,
    tenant,
    query: TeamsList,
    useCache: true,
    persistCache: 900000, // 15 minutes
    fetchNextPages: true,
    skip: browser && !!window?.name, // don't get the list if it is a popup window
    variables: { page: 1, limit: 100 },
  }).finally(() => {
    basicTeamsPending = false;
    showStatus();
  });

  function showStatus() {
    if (authUserPending) setSplashStatusText('Checking authentication...');
    else if (configPending) setSplashStatusText('Loading configuration...');
    else if (mePending) setSplashStatusText('Loading profile...');
    else if (profilesPending) setSplashStatusText('Loading contacts list...');
    else if (basicTeamsPending) setSplashStatusText('Loading teams list...');
    else setSplashStatusText('Loading page...');
  }
  showStatus();

  const data: LayoutDataType = {
    authUser: await authUser,
    sessionId,
    configuration: (await config)?.data?.configuration,
    me: (await me)?.data?.user,
    basicProfiles: await basicProfiles,
    basicTeams: await basicTeams,
    tenant: params.tenant,
  };

  // make the layout data available in the window
  // so child windows can access it
  if (browser) localStorage.setItem('share:layoutData', JSON.stringify(data));

  return data;
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

interface LayoutDataType {
  authUser: AuthUserType;
  sessionId: string;
  configuration: GlobalConfigQuery['configuration'];
  me: BasicProfileMeQuery['user'];
  basicProfiles: Readable<StoreReturnType<UsersListQuery>>;
  basicTeams: Readable<StoreReturnType<TeamsListQuery>>;
  tenant: string;
}
