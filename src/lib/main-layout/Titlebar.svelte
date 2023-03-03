<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { server } from '$utils/constants';
  import { appWindow } from '@tauri-apps/api/window';
  import { Flyout, IconButton, PersonPicture, TextBlock } from 'fluent-svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { LayoutData } from '../../routes/(standard)/[tenant]/$types';
  import Profile from './Profile.svelte';

  export let data: LayoutData;

  //@ts-expect-error userAgentData is only available in some browsers
  const isMacLike = navigator.userAgentData
    ? //@ts-expect-error userAgentData is only available in some browsers
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgentData.platform)
    : /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  let flyoutOpen: boolean = false;
  let browserFocused: boolean = browser && window.document.hasFocus();

  function handleFocus() {
    browserFocused = true;
  }

  function handleBlur() {
    browserFocused = false;
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    }
  });

  let isMaximized = false;
  onMount(async () => {
    if (data.tauri) {
      isMaximized = await appWindow.isMaximized();
      appWindow.onResized(async () => {
        isMaximized = await appWindow.isMaximized();
      });
    }
  });

  // right controls: <- -> | title     […] [_] [■] [X]
  // left controls:  [X] [_] [■] | <- -> | title     […]
</script>

<div class="titlebar" class:browserFocused class:tauri={data.tauri} data-tauri-drag-region>
  <div class="left">
    {#if !isMacLike}
      <svg xmlns="http://www.w3.org/2000/svg" width="41.57" height="26" viewBox="0 0 31.1775 36">
        <path
          d="m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z"
        />
        <path
          d="M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z"
        />
      </svg>
    {/if}
    <TextBlock variant="caption" data-tauri-drag-region>
      {#if $page.url.hostname === 'cristata.app'}
        Cristata (Preview)
      {:else}
        Cristata (Development)
      {/if}
    </TextBlock>
  </div>
  <div class="right">
    <div class="account" data-tauri-drag-region class:tauri={data.tauri}>
      <Flyout
        placement="bottom"
        alignment="end"
        bind:open={flyoutOpen}
        style="
          --fds-flyout-transform: translateY(0%); /* required, but is not added when alignment=end */
          --fds-flyout-transition-offset: translateY(-24px) /* this is twice the default */
        "
      >
        <IconButton>
          {#if data.tauri}
            <TextBlock variant="caption" style="margin-right: 10px;">{data.authUser.name}</TextBlock>
          {/if}
          <PersonPicture
            size={26}
            src="{server.location}/v3/{data.authUser.tenant}/user-photo/{data.authUser._id}"
            alt={data.authUser.name}
          />
        </IconButton>
        <svelte:fragment slot="flyout">
          <Profile {data} bind:flyoutOpen />
        </svelte:fragment>
      </Flyout>
    </div>
    {#if data.tauri}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <img
        src="window-controls/minimize.svg"
        alt="Close"
        title="Minimize"
        class="window-controls windows"
        on:click={() => appWindow.minimize()}
      />
      {#if isMaximized}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          src="window-controls/restore.svg"
          alt="Close"
          title="Maximize"
          class="window-controls windows"
          on:click={() => appWindow.toggleMaximize()}
        />
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          src="window-controls/maximize.svg"
          alt="Close"
          title="Maximize"
          class="window-controls windows"
          on:click={() => appWindow.toggleMaximize()}
        />
      {/if}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <img
        src="window-controls/close.svg"
        alt="Close"
        title="Close"
        class="window-controls windows close"
        on:click={() => appWindow.close()}
      />
    {/if}
  </div>
</div>

<style>
  .titlebar {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: env(titlebar-area-width, 100%);
    height: env(titlebar-area-height, 33px);
    -webkit-app-region: drag;
    app-region: drag;
    user-select: none;
    justify-content: space-between;
    background-color: #f3f3f3;
    background-color: transparent;
    padding: 0 16px;
    box-sizing: border-box;
    color: #888888;
  }

  .titlebar.browserFocused,
  .titlebar.browserFocused .account.tauri :global(.icon-button) {
    color: #000000;
  }
  .titlebar.browserFocused .window-controls.windows {
    opacity: 1;
  }

  @media (prefers-color-scheme: dark) {
    .titlebar.browserFocused,
    .titlebar.browserFocused .account.tauri :global(.icon-button) {
      color: #ffffff;
    }
  }

  .left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }

  svg {
    width: 16px;
    height: 16px;
    margin: 0 16px 0 0;
    fill: var(--color-primary-800);
  }
  @media (prefers-color-scheme: dark) {
    .titlebar {
      background-color: #202020;
    }

    svg {
      fill: var(--color-primary-300);
    }
  }

  .titlebar.tauri {
    background-color: transparent;
    padding-right: 0;
  }

  .account {
    -webkit-app-region: no-drag;
    app-region: no-drag;
  }
  .account :global(.flyout) {
    min-inline-size: 300px;
    padding: 0;
  }
  .account :global(.icon-button) {
    padding: 2px;
  }
  .account.tauri :global(.icon-button) {
    padding: 4px 10px 3px;
    border-radius: 0;
    color: #888888;
  }
</style>
