<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { TeamQuery } from '$graphql/graphql';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { genAvatar } from '$utils/genAvatar';
  import { notEmpty } from '$utils/notEmpty';
  import { getPasswordStatus } from '@jackbuehner/cristata-utils';
  import { Button, MenuFlyout, MenuFlyoutDivider, MenuFlyoutItem, TextBlock } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  export let open = false;
  export let person: NonNullable<NonNullable<NonNullable<TeamQuery['team']>['members']>[0]>;
  export let flyIn = false;
  export let style = '';

  const { temporary, expired } = getPasswordStatus(person.flags.filter(notEmpty));
</script>

<div
  class="person-card"
  in:fly={{ y: flyIn ? 40 : 0, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
>
  <Button
    on:click={() => {
      open = !open;
    }}
    {style}
  >
    <div style="margin-top: {$compactMode ? 20 : 40}px;">
      <MenuFlyout bind:open class="person-menu" placement="right" alignment="start" offset={0}>
        <svelte:fragment slot="flyout">
          <MenuFlyoutItem
            on:click={() => {
              const url = new URL(`/${$page.params.tenant}/profile/${person._id}`, $page.url.origin);
              if (person.name) url.searchParams.set('name', person.name);
              if (person.current_title) url.searchParams.set('current_title', person.current_title);
              goto(url);
            }}
          >
            <svelte:fragment slot="icon">
              <FluentIcon name="Person20Regular" />
            </svelte:fragment>
            View profile
          </MenuFlyoutItem>
          {#if person.email}
            <MenuFlyoutDivider />
            <MenuFlyoutItem indented on:click={() => window.open(`mailto:${person.email}`)}>
              Send email
            </MenuFlyoutItem>
          {/if}
        </svelte:fragment>
      </MenuFlyout>
    </div>
    <article class:compact={$compactMode}>
      <img src={person.photo || genAvatar(person._id, 36, 'beam')} alt="" class="person-photo" />
      <div class="person-meta" class:compact={$compactMode}>
        <TextBlock>{person.name}</TextBlock>

        {#if !$compactMode}
          <TextBlock>{person.current_title || 'Employee'}</TextBlock>
        {/if}

        {#if person.retired}
          <TextBlock><i class="danger">Account deactivated</i></TextBlock>
        {:else if expired}
          <TextBlock><i class="danger">Invitation expired</i></TextBlock>
        {:else if temporary}
          <TextBlock><i class="danger">Pending invitation acceptance</i></TextBlock>
        {:else if $compactMode}
          <TextBlock>{person.current_title || 'Employee'}</TextBlock>
        {:else}
          <TextBlock>{person.email || person._id.slice(-6)}</TextBlock>
        {/if}
      </div>
      <FluentIcon name="MoreHorizontal16Regular" />
    </article>
  </Button>
</div>

<style>
  article {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 4px;
    color: var(--fds-text-primary);
    width: 100%;
    overflow: hidden;
  }

  article.compact {
    gap: 12px;
    padding: 3px 0;
  }

  article > :global(svg) {
    fill: currentColor;
    margin-left: auto;
  }

  article :global(.person-menu) {
    position: fixed;
  }

  .person-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    text-indent: -20px;
    padding-left: 20px;
  }

  .person-meta :global(span.text-block:first-of-type) {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .person-meta.compact :global(span.text-block:first-of-type) {
    font-size: 14px;
  }

  .person-meta :global(span.text-block:not(:first-of-type)) {
    line-height: 16px;
    color: var(--fds-text-secondary);
  }

  img.person-photo {
    border-radius: 50%;
    box-shadow: inset 0 0 0 1.5px black;
    -webkit-user-drag: none;
    width: 36px;
    height: 36px;
  }

  .danger {
    color: var(--color-danger-800);
  }
  @media (prefers-color-scheme: dark) {
    .danger {
      color: var(--color-danger-300);
    }
  }
</style>
