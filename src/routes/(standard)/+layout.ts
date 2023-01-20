import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { server } from '$utils/constants';
import { isHttpError } from '$utils/isHttpError';
import { error, redirect } from '@sveltejs/kit';
import mongoose from 'mongoose';
import { z } from 'zod';
import { persistor } from '../../redux/store';
import type { LayoutLoad } from './$types';

export const load = (async ({ fetch, url }) => {
  // try to get the current tenant from the url if it exists
  const maybeTenant: string | undefined = url.pathname.split('/')[1];

  // check the authentication status of the current client
  const authUser = await fetch(`${server.location}/auth`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      // redirect to the sign in page if not authenticated or authorized
      if (res.status === 401 || res.status === 403) {
        await gotoSignIn(maybeTenant);
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
      return await validator.parseAsync(authResponse).catch((err) => {
        throw error(500, err);
      });
    });

  return { authUser };
}) satisfies LayoutLoad;

const userValidator = z.object({
  _id: z.string().transform((hexId) => new mongoose.Types.ObjectId(hexId)),
  name: z.string(),
  provider: z.string(),
  tenant: z.string(),
});

const validator = userValidator.extend({
  otherUsers: userValidator.array().default([]),
});

async function gotoSignIn(tenant?: string) {
  // clear cached data
  await persistor.purge(); // clear persisted redux store
  // await client.clearStore(); // clear persisted apollo data
  window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this

  // redirect
  const url = new URL(`${import.meta.env.VITE_API_PROTOCOL}//${import.meta.env.VITE_AUTH_BASE_URL}`);
  if (tenant) url.pathname = `/${tenant}`;
  if (browser) goto(url.href);
  else throw redirect(307, url.href);
}
