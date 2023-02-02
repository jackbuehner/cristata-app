import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import { persistor } from '../redux/store';

export async function gotoSignIn(tenant?: string) {
  // clear cached data
  await persistor.purge(); // clear persisted redux store
  // await client.clearStore(); // clear persisted apollo data
  if (browser) window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this

  // redirect
  const url = new URL(`${import.meta.env.VITE_API_PROTOCOL}//${import.meta.env.VITE_AUTH_BASE_URL}`);
  if (tenant) url.pathname = `/${tenant}`;
  if (browser) goto(url.href);
  else throw redirect(307, url.href);
}
