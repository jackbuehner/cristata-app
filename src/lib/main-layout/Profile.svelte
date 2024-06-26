<script lang="ts">
  import { goto } from '$app/navigation';
  import { VITE_API_PROTOCOL, VITE_AUTH_BASE_URL } from '$env/static/public';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { server } from '$utils/constants';
  import { Button, Flyout, IconButton, PersonPicture, TextBlock } from 'fluent-svelte';
  import { persistor } from '../../redux/store';
  import type { LayoutData } from '../../routes/(standard)/[tenant]/$types';

  export let data: LayoutData;
  export let flyoutOpen: boolean;
</script>

<div id="account-switcher-content">
  <div class="current-profile">
    <PersonPicture
      size={60}
      src="{server.location}/v3/{data.authUser.tenant}/user-photo/{data.authUser._id}"
      alt={data.authUser.name}
    />
    <div style="margin: 12px 0 6px 0;">
      <TextBlock variant="bodyLarge">{data.authUser.name}</TextBlock>
    </div>
    <div style="color: var(--fds-text-secondary); display: flex; flex-direction: column;">
      {#if data.me?.current_title}
        <TextBlock variant="caption">{data.me.current_title}</TextBlock>
      {/if}
      {#if data.me?.email}
        <TextBlock variant="caption">{data.me.email}</TextBlock>
      {/if}
    </div>
    <div class="button-row">
      <Button
        href="/{data.authUser.tenant}/profile/{data.authUser._id}"
        on:click={(e) => {
          e.preventDefault();
          goto(`/${data.authUser.tenant}/profile/${data.authUser._id}`);
          flyoutOpen = false;
        }}
      >
        <FluentIcon name="Person24Regular" mode="buttonIconLeft" />
        View profile
      </Button>
    </div>
  </div>
  <hr />
  <div class="account-switcher">
    {#if data.authUser.otherUsers?.length > 0}
      {#each data.authUser.otherUsers as { _id, name, tenant }}
        <Button
          variant="hyperlink"
          style="margin: 0 10px; width: calc(100% - 20px);"
          on:click={async () => {
            // clear cached data
            await persistor.purge(); // clear persisted redux store
            // await client.clearStore(); // clear persisted apollo data
            window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this

            // switch accounts
            const url = new URL(`${server.location}/auth/switch/${tenant}`);
            url.searchParams.set(
              'return',
              window.location.origin + `/${tenant}` + location.pathname.replace(`/${data.authUser.tenant}`, '')
            );
            window.location.href = url.href;
          }}
        >
          <div class="account">
            <PersonPicture size={34} src="{server.location}/v3/{tenant}/user-photo/{_id}" alt={name} />
            <div>
              <div class="account-name">{name}</div>
              <div class="account-caption">{tenant}</div>
            </div>
          </div>
        </Button>
      {/each}
      <Button
        href="{VITE_API_PROTOCOL}//{VITE_AUTH_BASE_URL}"
        variant="hyperlink"
        style="margin: 0 10px; width: calc(100% - 20px);"
      >
        <div class="account">
          <FluentIcon name="PersonAdd24Regular" />
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <div class="account-name">Add another account</div>
          </div>
        </div>
      </Button>
    {:else}
      <Button href="{VITE_API_PROTOCOL}//{VITE_AUTH_BASE_URL}">
        <FluentIcon name="PersonAdd24Regular" mode="buttonIconLeft" />
        Add another account
      </Button>
    {/if}
  </div>
  <hr />
  <div
    style="margin-top: 0px; display: flex; flex-direction: row; justify-content: center; gap: 6px; padding-bottom: 16px;"
  >
    <Button href="/{data.authUser.tenant}/sign-out">
      <FluentIcon name="SignOut24Regular" mode="buttonIconLeft" />
      Sign out of all accounts
    </Button>
  </div>
</div>

<style>
  #account-switcher-content {
    width: 300px;
    text-align: center;
    border: 1px solid var(--fds-divider-stroke-default);
    border-radius: var(--fds-overlay-corner-radius);
  }

  .current-profile {
    padding: 20px 20px 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .current-profile .button-row {
    margin-top: 12px;
    display: flex;
    gap: 6px;
  }

  hr {
    width: 100%;
    height: 0;
    appearance: none;
    border: none;
    border-top: 1px solid var(--fds-divider-stroke-default);
    margin-block: 20px;
  }

  .account-switcher {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: -8px 0px;
    gap: 4px;
  }

  .account-switcher > :global(.button) {
    color: currentColor !important;
    cursor: default !important;
  }

  .account-switcher .account {
    display: flex;
    flex-direction: row;
    gap: 10px;
    width: 100%;
  }

  .account-switcher .account :global(svg) {
    fill: currentColor;
    width: 16px;
    padding: 0 9px;
  }

  .account-switcher .account-name {
    font-size: 15px;
    line-height: 1.15;
    text-align: left;
  }

  .account-switcher .account-caption {
    font-size: 13px;
    line-height: 1.15;
    text-align: left;
    color: var(--fds-text-tertiary);
  }
</style>
