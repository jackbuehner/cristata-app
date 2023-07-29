<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Chip } from '$lib/common/Chip';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import NewTokenDialog from '$lib/dialogs/NewTokenDialog.svelte';
  import { motionMode } from '$stores/motionMode';
  import { formatISODate } from '$utils/formatISODate';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, Expander, ProgressRing, TextBlock, ToggleSwitch } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  export let data;
  $: ({ tokens } = data);

  $: if (browser) document.title = 'Manage tokens';

  let showInactiveTokens = false;
</script>

<div class="wrapper">
  <div class="header">
    <PageTitle>Tokens</PageTitle>

    <ActionRow>
      {#if true}
        <Button
          variant="accent"
          on:click={() => {
            goto(`/${data.authUser.tenant}/configuration/security/tokens/create`);
          }}
          disabled={$tokens.loading}
        >
          <FluentIcon name="Add16Regular" mode="buttonIconLeft" />
          Create token
        </Button>
        <Button
          style="width: 130px;"
          on:click={() => {
            $tokens.refetch();
          }}
          disabled={$tokens.loading}
        >
          {#if $tokens.loading}
            <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
          {:else}
            <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
            Refresh list
          {/if}
        </Button>
      {/if}
      <ToggleSwitch bind:checked={showInactiveTokens}>Show inactive tokens</ToggleSwitch>
    </ActionRow>

    <div class="text">
      <TextBlock>
        Tokens allow you to authenticate your API requests when you need to access non-public data.
      </TextBlock>
      <TextBlock>
        To use a token in an API request, use an <code>'Authorization'</code>
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers">header</a>
        with the value
        <code>'app-token {`<tokenValue>`}'</code>.
      </TextBlock>
    </div>
  </div>

  {#if $tokens.data?.configuration?.security.tokens}
    <section
      class="tokens-list"
      in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
    >
      {#each $tokens.data.configuration.security.tokens
        .filter(notEmpty)
        .sort((a, b) => {
          if (a.expires === 'never' && b.expires !== 'never') return 1;
          return new Date(a.expires) > new Date(b.expires) ? -1 : 1;
        })
        .sort((a, b) => {
          const aInactive = new Date(a.expires) < new Date() || Object.entries(a.scope).filter(([, val]) => !!val).length === 0;
          const bInactive = new Date(b.expires) < new Date() || Object.entries(b.scope).filter(([, val]) => !!val).length === 0;
          if (aInactive && !bInactive) return 1;
          if (!aInactive && bInactive) return -1;
          return 0;
        }) || [] as token}
        {@const expired = new Date(token.expires) < new Date()}
        {@const noScope = Object.entries(token.scope).filter(([, val]) => !!val).length === 0}
        {@const inactive = expired || noScope}
        {#if !inactive || (inactive && showInactiveTokens)}
          <Expander
            href="/{data.tenant}/configuration/security/tokens/{token._id}"
            class="scope-expander {inactive ? 'inactive' : ''}"
          >
            <svelte:fragment slot="icon">
              {#if inactive}
                <FluentIcon name="ShieldProhibited24Regular" />
              {:else if token.scope.admin || token.expires === 'never'}
                <FluentIcon name="ShieldError24Regular" />
              {:else}
                <FluentIcon name="Shield24Regular" />
              {/if}
            </svelte:fragment>
            <span style="margin-right: 10px;">{token.name}</span>
            {#if expired}
              <Chip color="neutral" compact={true}>expired</Chip>
            {/if}
            {#if noScope}
              <Chip color="neutral" compact={true}>scope: none</Chip>
            {/if}
            <svelte:fragment slot="side">
              {#if token.expires === 'never'}
                Never expires
              {:else if new Date(token.expires) < new Date()}
                Expired {formatISODate(token.expires, false, true, true)}
              {:else}
                Expires {formatISODate(token.expires, false, true, true)}
              {/if}
            </svelte:fragment>
          </Expander>
        {/if}
      {/each}
    </section>
  {/if}
</div>

<NewTokenDialog
  token={$page.url.searchParams.get('newToken') || ''}
  handleAction={async () => {
    // remove newToken from the URL, which also causes the dialog to close
    goto(`/${data.authUser.tenant}/configuration/security/tokens`);
  }}
/>

<style>
  .text {
    margin: 0 auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  .tokens-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  :global(.scope-expander.inactive) {
    color: var(--fds-text-disabled) !important;
  }
</style>
