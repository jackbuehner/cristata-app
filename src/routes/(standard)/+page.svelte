<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authCache, authUserValidator } from '$stores/authCache';
  import { server } from '$utils/constants';
  import { gotoSignIn } from '$utils/gotoSignIn';
  import { setSplashStatusText } from '$utils/setSplashStatusText';
  import { onMount } from 'svelte';

  onMount(() => {
    setSplashStatusText('Redirecting to organization...');

    fetch(`${server.location}/auth`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        // redirect to the sign in page if not authenticated or authorized or endpoint is missing
        if (res.status === 401 || res.status === 403 || res.status === 404) throw res.status;

        // return the response json object
        return await res.json();
      })
      .then(async (authResponse) => {
        const authUser = await authUserValidator.parseAsync(authResponse).catch((err) => {
          throw err;
        });

        authCache.set({ last: new Date(), authUser });
        goto(`/${authUser.tenant}`);
      })
      .catch(async (err) => {
        await gotoSignIn(undefined, $page.url.origin);
      });
  });
</script>

Tenant is missing
