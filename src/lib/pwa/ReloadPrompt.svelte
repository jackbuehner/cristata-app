<script lang="ts">
  import { Button, InfoBar } from 'fluent-svelte';
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
  <InfoBar
    title="Cristata application alert"
    message={$offlineReady
      ? 'Ready to work offline. Some parts of Cristata will work in read-only mode when you do not have an internet connection.'
      : 'An update is a available. Some features may not work unless you update.'}
    class="pwatoast"
    closable={false}
  >
    <svelte:fragment slot="action">
      <div class="button-row">
        {#if $needRefresh}
          <Button on:click={() => updateServiceWorker(true)}>Install update (estimate: 10 seconds)</Button>
        {/if}
        <Button>Dismiss</Button>
      </div>
    </svelte:fragment>
  </InfoBar>
{/if}

<style>
  :global(.pwatoast) {
    position: fixed !important;
    right: 10px;
    bottom: 10px;
    z-index: 2;
    background-color: var(--fds-solid-background-quarternary) !important;
    max-width: 400px;
    min-width: 300px;
  }

  :global(.pwatoast .info-bar-content) {
    flex-direction: column;
  }

  :global(.pwatoast .info-bar-content p) {
    margin-top: 10px !important;
  }

  .button-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
  }

  .button-row :global(button) {
    white-space: nowrap;
  }
</style>
