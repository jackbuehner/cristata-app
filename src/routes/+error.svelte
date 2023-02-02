<script lang="ts">
  import { page } from '$app/stores';
  import now from '~build/time';
  import { persistor } from '../redux/store';
</script>

<div class="errorwrapper">
  <div class="errorblock">
    <p>{$page.error?.message}</p>
    <p style="font-size: 14px; font-style: italic;">{`\n Build date: ${now.toISOString()}`}</p>
    <button on:click={() => (window.location.href = window.location.href)}>Try again</button>
    <button
      on:click={async () => {
        await persistor.purge(); // clear persisted redux store
        // await client.clearStore(); // clear persisted apollo data
        window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this
        const tenant = window.location.pathname.split('/')[1];
        window.location.href = `${import.meta.env.VITE_API_PROTOCOL}//${import.meta.env.VITE_AUTH_BASE_URL}/${
          tenant || ''
        }/sign-out?return=${encodeURIComponent(window.location.origin + '/' + tenant)}`;
      }}>Sign out</button
    >
    <div>
      <button
        on:click={async () => {
          await persistor.purge(); // clear persisted redux store
          // await client.clearStore(); // clear persisted apollo data
          window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (let registration of registrations) {
                registration.unregister();
              }
            });
          }
          window.location.href = window.location.href;
        }}>Clear cache</button
      >
      <button
        on:click={async () => {
          await persistor.purge(); // clear persisted redux store
          // await client.clearStore(); // clear persisted apollo data
          window.localStorage.clear();
          window.sessionStorage.clear();
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (let registration of registrations) {
                registration.unregister();
              }
            });
          }
          const tenant = window.location.pathname.split('/')[1];
          window.location.href = `${import.meta.env.VITE_API_PROTOCOL}//${import.meta.env.VITE_AUTH_BASE_URL}/${
            tenant || ''
          }/sign-out?return=${encodeURIComponent(window.location.origin + '/' + tenant)}`;
        }}>Reset app</button
      >
    </div>
  </div>
</div>

<div>
  <style>
    .root-splash-wrapper {
      display: none !important;
    }
  </style>
</div>

<style>
  div.errorwrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  div.errorblock {
    font-family: var(--font-detail, system-ui, sans-serif);
    color: white;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    bottom: 100px;
    width: 260px;
    align-items: center;
  }

  div.errorblock > button {
    width: 100%;
  }

  div.errorblock > div {
    width: 100%;
    display: flex;
    gap: 10px;
  }

  div.errorblock > div > button {
    width: calc(50% - 5px);
  }

  p {
    margin: 0;
  }
</style>
