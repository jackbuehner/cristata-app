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
import { server } from '$utils/constants';
import { gotoSignIn } from '$utils/gotoSignIn';
import { isHttpError } from '$utils/isHttpError';
import { error, redirect } from '@sveltejs/kit';
import mongoose from 'mongoose';
import { get, writable } from 'svelte/store';
import { z } from 'zod';
import { setAuthProvider, setName, setObjectId, setOtherUsers } from '../../../redux/slices/authUserSlice';
import { persistor, store } from '../../../redux/store';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

const authCache = writable<{ last: Date; authUser: z.infer<typeof authUserValidator> }>();

export const load = (async ({ params, url, fetch }) => {
  const { tenant } = params;

  // check the authentication status of the current client
  const authUser = (async (): Promise<z.infer<typeof authUserValidator>> => {
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
          await gotoSignIn(tenant);
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

  // get/set the session id
  const sessionId = (() => {
    if (browser) {
      const id = sessionStorage.getItem('sessionId') || Math.random().toString();
      sessionStorage?.setItem('sessionId', id);
      return id;
    }
    return Math.random().toString();
  })();

  // get the configuration
  const config = query<GlobalConfigQuery>({
    fetch,
    tenant,
    query: GlobalConfig,
    useCache: true,
  });

  // get the current user basic profile
  const me = query<BasicProfileMeQuery>({
    fetch,
    tenant,
    query: BasicProfileMe,
    useCache: true,
  });

  // get the list of all users
  const basicProfiles = queryWithStore<UsersListQuery, UsersListQueryVariables>({
    fetch,
    tenant,
    query: UsersList,
    useCache: true,
    persistCache: 900000, // 15 minutes
    fetchNextPages: true,
    skip: browser && !!window?.name, // don't get the list if it is a popup window
    variables: { page: 1, limit: 100 },
  });

  // get the list of all teams
  const basicTeams = queryWithStore<TeamsListQuery, TeamsListQueryVariables>({
    fetch,
    tenant,
    query: TeamsList,
    useCache: true,
    persistCache: 900000, // 15 minutes
    fetchNextPages: true,
    skip: browser && !!window?.name, // don't get the list if it is a popup window
    variables: { page: 1, limit: 100 },
  });

  return {
    authUser: await authUser,
    sessionId,
    configuration: (await config)?.data?.configuration,
    me: (await me)?.data?.user,
    basicProfiles: await basicProfiles,
    basicTeams: await basicTeams,
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

const userValidator = z.object({
  _id: z.string().transform((hexId) => new mongoose.Types.ObjectId(hexId)),
  name: z.string(),
  provider: z.string(),
  tenant: z.string(),
});

const authUserValidator = userValidator.extend({
  otherUsers: userValidator.array().default([]),
});
