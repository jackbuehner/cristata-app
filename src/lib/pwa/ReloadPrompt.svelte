<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import { useRegisterSW } from 'virtual:pwa-register/svelte';
  const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
    onRegistered(r) {
      console.log(
        `[Service Worker] Registering service Worker from __BUILD_DATE_ISO__ at: ${pwaInfo?.registerSW?.registerPath}`
      );

      r &&
        setInterval(() => {
          console.log('[Service Worker] Checking for sw update');
          r.update();
        }, 60000 /* check every minute */);

      console.log('[Service Worker] Successfully registered: ', r);
    },
    onRegisterError(error) {
      console.log('[Service Worker] Registration error:', error);
    },
  });
  const close = () => {
    offlineReady.set(false);
    needRefresh.set(false);
  };
  $: toast = $offlineReady || $needRefresh;
</script>

{#if toast}
  <div class="pwa-toast" role="alert">
    <div class="message">
      {#if $offlineReady}
        <span>
          Ready to work offline. Some parts of Cristata will work in read-only mode when you do not have an
          internet connection.
        </span>
      {:else}
        <span> An update is a available. Some features may not work unless you update. </span>
      {/if}
    </div>
    {#if $needRefresh}
      <button on:click={() => updateServiceWorker(true)}> Install update </button>
    {/if}
    <button on:click={close}> Close </button>
  </div>
{/if}

<style>
  .pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    padding: 12px;
    border: 1px solid #8885;
    border-radius: 4px;
    z-index: 2;
    text-align: left;
    box-shadow: 3px 4px 5px 0 #8885;
    background-color: white;
  }
  .pwa-toast .message {
    margin-bottom: 8px;
  }
  .pwa-toast button {
    border: 1px solid #8885;
    outline: none;
    margin-right: 5px;
    border-radius: 2px;
    padding: 3px 10px;
  }
</style>
