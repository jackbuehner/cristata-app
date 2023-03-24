<script lang="ts">
  import { page } from '$app/stores';
  import { VITE_API_BASE_URL, VITE_API_PROTOCOL } from '$env/static/public';
  import type { CollectionConfigQuery } from '$graphql/graphql';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import ArchiveSelectedDocs from '$lib/dialogs/ArchiveSelectedDocs.svelte';
  import DeleteSelectedDocs from '$lib/dialogs/DeleteSelectedDocs.svelte';
  import { openWindow } from '$utils/openWindow';
  import { Button } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let show = false;
  export let tableData: NonNullable<PageData['table']>['data'];
  export let selectedIds: string[] = [];
  export let collection: NonNullable<NonNullable<CollectionConfigQuery['configuration']>['collection']>;
  export let shouldOpenMaximized = false;

  const links = {
    href: `/${$page.params.tenant}/cms/collection/${$page.params.collection}`,
    hrefSuffixKey: collection?.by?.one || '_id',
    hrefSearch: shouldOpenMaximized ? '?fs=1&props=1' : undefined,
    windowName: `editor-${$page.params.tenant}-${collection.name}-`,
  };

  $: firstSelectedHref = `${links.href}/${
    ($tableData?.data?.data?.docs || []).find((doc: { _id: string }) => doc._id === selectedIds[0])?.[
      links.hrefSuffixKey
    ]
  }${links.hrefSearch || ''}`;

  let deleteDialogOpen = false;
  let archiveDialogOpen = false;
</script>

<div class="actions" class:show>
  {#if $tableData.data?.actionAccess?.hide}
    <Button disabled={selectedIds.length === 0} on:click={() => (deleteDialogOpen = !deleteDialogOpen)}>
      <FluentIcon name="Delete20Regular" mode="buttonIconLeft" />
      Delete
    </Button>
  {/if}

  {#if $tableData.data?.actionAccess?.archive}
    <Button disabled={selectedIds.length === 0} on:click={() => (archiveDialogOpen = !archiveDialogOpen)}>
      <FluentIcon name="Archive20Regular" mode="buttonIconLeft" />
      Archive
    </Button>
  {/if}

  {#if collection.name === 'File'}
    <Button
      href="{VITE_API_PROTOCOL}//{VITE_API_BASE_URL}/filestore/{$page.params.tenant}/{selectedIds[0]}"
      disabled={selectedIds.length !== 1}
      on:click={(evt) => {
        evt.preventDefault();
        openWindow(
          `${VITE_API_PROTOCOL}//${VITE_API_BASE_URL}/filestore/${$page.params.tenant}/${selectedIds[0]}`,
          links.windowName + selectedIds[0],
          'location=no'
        );
      }}
    >
      <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
      Open preview
    </Button>
  {:else}
    <Button
      disabled={selectedIds.length !== 1}
      on:click={() => {
        navigator.clipboard.writeText(`${$page.url.origin}${firstSelectedHref}`);
      }}
    >
      <FluentIcon name="Link20Regular" mode="buttonIconLeft" />
      Copy link
    </Button>
    <Button
      href={firstSelectedHref}
      disabled={selectedIds.length !== 1}
      on:click={(evt) => {
        evt.preventDefault();
        openWindow(firstSelectedHref, links.windowName + selectedIds[0], 'location=no');
      }}
    >
      <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
      Open in Editor
    </Button>
  {/if}
</div>

<DeleteSelectedDocs
  bind:open={deleteDialogOpen}
  tenant={$page.params.tenant}
  byOne={collection.by.one}
  {selectedIds}
  schemaName={collection.name}
  handleSumbit={async () => {
    await $tableData.refetch();
  }}
/>

<ArchiveSelectedDocs
  bind:open={archiveDialogOpen}
  tenant={$page.params.tenant}
  byOne={collection.by.one}
  {selectedIds}
  schemaName={collection.name}
  handleSumbit={async () => {
    await $tableData.refetch();
  }}
/>

<style>
  div.actions {
    position: absolute;
    bottom: -60px;
    opacity: 0;
    transition: 240ms;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--fds-solid-background-quarternary);
    /* background-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][300]).alpha(0.3).string()}; */
    backdrop-filter: blur(20px);
    border-radius: var(--fds-control-corner-radius);
    display: flex;
    flex-direction: row;
    box-shadow: 0px 25.6px 57.6px rgb(0 0 0 / 14%), 0px 0px 16.4px rgb(0 0 0 / 12%);
    z-index: 1;
    height: 40px;
  }

  div.actions.show {
    bottom: 0px;
    opacity: 1;
  }

  div.actions :global(.button) {
    border-radius: 0px;
    white-space: nowrap;
  }
  div.actions :global(.button:first-child) {
    border-top-left-radius: var(--fds-control-corner-radius);
    border-bottom-left-radius: var(--fds-control-corner-radius);
  }
  div.actions :global(.button:last-child) {
    border-top-right-radius: var(--fds-control-corner-radius);
    border-bottom-right-radius: var(--fds-control-corner-radius);
  }
</style>
