<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import UploadFile from '$lib/cms/UploadFile.svelte';
  import UploadPhoto from '$lib/cms/UploadPhoto.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import CreateNewDocDialog from '$lib/dialogs/CreateNewDocDialog.svelte';
  import { motionMode } from '$stores/motionMode';
  import { server } from '$utils/constants';
  import { hasKey } from '$utils/hasKey';
  import { notEmpty } from '$utils/notEmpty';
  import { uncapitalize } from '$utils/uncapitalize';
  import { camelToDashCase } from '@jackbuehner/cristata-utils';
  import {
    Button,
    MenuFlyout,
    MenuFlyoutDivider,
    MenuFlyoutItem,
    ProgressRing,
    TextBox,
    Tooltip,
  } from 'fluent-svelte';
  import pluralize from 'pluralize';
  import { onMount } from 'svelte';
  import { hooks } from 'svelte-preprocess-react';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';
  import CollectionGrid from './CollectionGrid.svelte';
  import CollectionTable from './CollectionTable.svelte';
  import DetailsPane from './DetailsPane.svelte';

  export let data: PageData;
  $: ({ data: tableData } = data.table);

  $: collectionName = data.collection.schemaName;
  $: collectionNameSingular = uncapitalize(data.collection.name.singular);
  $: collection = data.configuration?.collections?.filter(notEmpty).find((col) => col.name === collectionName);

  $: pageTitle =
    // if defined, attempt to use the page title in the query string
    $page.url.searchParams.get('__pageTitle') ||
    // otherwise, build a title using the collection name
    (collectionName === 'Photo' ? 'Photo library' : data.collection.name.plural + ' collection');

  $: if (browser) document.title = `${pageTitle} - Cristata`;

  // keep the search box value representative of the URL search params
  let searchBoxValue = calculateSearchBoxValue();
  afterNavigate(() => {
    searchBoxValue = calculateSearchBoxValue();
  });

  /**
   * Create a string for the search box that is representative of the
   * URL search params.
   */
  function calculateSearchBoxValue() {
    let str = Array.from($page.url.searchParams.entries())
      .filter(([key]) => {
        if (key.includes('__')) {
          return false;
        }
        if (key.includes('_')) {
          if (key === '_search') return true;
          return false;
        }
        return true;
      })
      .map(([key, value]) => {
        if (key === '_search') return value;
        return `${key}:${value}`;
      })
      .join(' ');

    // add space to the end of the string if there are only filters
    if (!$page.url.searchParams.has('_search')) {
      str += ' ';
    }

    return str.trimStart();
  }

  /**
   * Updates the URL search params based on the search box value.
   */
  function setSearchFilters() {
    let filters = [];
    let search = '';
    searchBoxValue.split(' ').forEach((val) => {
      if (val.split(':').length === 2) {
        filters.push(val.split(':'));
      } else {
        search += ` ${val}`;
      }
    });
    if (search.trim().length > 0) filters.push(['_search', search.trim()]);

    const url = new URL($page.url.pathname, $page.url.origin);
    filters.forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    Array.from($page.url.searchParams.entries()).forEach(([key, value]) => {
      if (key.includes('__')) {
        url.searchParams.set(key, value);
      }
    });

    goto(url);
  }

  // control whether the dropdown with view options is open or closed
  let viewDropdownOpen = false;

  // upload a file and keep track of the progress
  let uploadInput: HTMLInputElement | null = null;
  let uploadProgress = 0; // should be between 0 and 1
  let uploadStatus: string | null = null;
  let uploadLoading = false;
  function upload() {
    uploadInput?.click();
  }

  // check whether the current user is allowed to create a new document
  $: canCreate = $tableData.data?.actionAccess?.create;

  let refetching = false;
  let loadingMore = false;
  $: loading = refetching || loadingMore || $tableData.loading;

  // the document list layout for this collection
  $: persistedViewLayout = (browser && localStorage.getItem(`${collectionName}:viewLayout`)) || '';
  onMount(() => {
    persistedViewLayout = (browser && localStorage.getItem(`${collectionName}:viewLayout`)) || '';
  });
  let viewLayout: 'table' | 'grid';
  $: viewLayout =
    persistedViewLayout === 'grid'
      ? 'grid'
      : persistedViewLayout === 'table'
      ? 'table'
      : collectionName === 'Photo'
      ? 'grid'
      : 'table';
  function setViewLayout(layout: typeof viewLayout) {
    localStorage.setItem(`${collectionName}:viewLayout`, layout);
    viewLayout = layout;
  }

  // the details pane setting for this collection
  $: persistedDetailsPane = (browser && localStorage.getItem(`${collectionName}:detailsPane`)) || '';
  onMount(() => {
    persistedDetailsPane = (browser && localStorage.getItem(`${collectionName}:detailsPane`)) || '';
  });
  let detailsPane: boolean;
  $: detailsPane =
    persistedDetailsPane === 'true'
      ? true
      : persistedDetailsPane === 'false'
      ? false
      : collectionName === 'Photo'
      ? true
      : false;
  function setDetailsPaneEnabled(enabled: typeof detailsPane) {
    localStorage.setItem(`${collectionName}:detailsPane`, `${enabled}`);
    detailsPane = enabled;
  }

  let createNewDocDialogOpen = false;
  let createNewDocDialogCounter = 1;
</script>

{#key createNewDocDialogCounter + collectionName}
  <CreateNewDocDialog
    tenant={data.authUser.tenant}
    schemaName={collectionName}
    title="Create new {collectionNameSingular}"
    bind:open={createNewDocDialogOpen}
    handleAction={async () => {
      createNewDocDialogCounter++;
    }}
    handleSumbit={async (itemId) => {
      if (typeof itemId === 'string') {
        goto(`/${data.authUser.tenant}/cms/collection/${data.params.collection}/${itemId}`);
      }
    }}
  />
{/key}

<div class="wrapper">
  <div class="header">
    {#key pageTitle}
      <div
        in:fly={{ y: 26, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
        style="
          margin: 32px 0 20px 0;
          min-height: 40px;
        "
      >
        <PageTitle fullWidth>
          {pageTitle}
          <span style="font-size: 65%; margin-left: 10px;">
            {uploadStatus || ''}
          </span>
        </PageTitle>
      </div>
    {/key}

    <ActionRow fullWidth>
      <Tooltip
        text={(() => {
          if (!collection?.canCreateAndGet) {
            return 'You do not have permission to create documents in this collection.';
          }
          return undefined;
        })()}
        offset={4}
        placement="bottom"
        alignment="start"
      >
        {#if collectionName === 'File'}
          <Button
            variant="accent"
            disabled={!!uploadStatus || uploadLoading || !canCreate || loading || !collection?.canCreateAndGet}
            on:click={upload}
            style="width: 130px;"
          >
            {#if uploadLoading}
              <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
            {:else}
              <FluentIcon name="ArrowUpload16Regular" mode="buttonIconLeft" />
              Upload file
            {/if}
          </Button>
        {:else if collectionName === 'Photo'}
          <Button
            variant="accent"
            disabled={!!uploadStatus || uploadLoading || !canCreate || loading || !collection?.canCreateAndGet}
            on:click={upload}
            style="width: 140px;"
          >
            {#if uploadLoading}
              <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
            {:else}
              <FluentIcon name="ArrowUpload16Regular" mode="buttonIconLeft" />
              Upload photo
            {/if}
          </Button>
        {:else}
          <Button
            variant="accent"
            disabled={!canCreate || loading || !collection?.canCreateAndGet}
            on:click={() => {
              createNewDocDialogCounter++;
              setTimeout(() => {
                createNewDocDialogOpen = !createNewDocDialogOpen;
              }, 1);
            }}
          >
            <FluentIcon name="DocumentAdd16Regular" mode="buttonIconLeft" />
            Create new {collectionNameSingular || 'document'}
          </Button>
        {/if}
      </Tooltip>

      <Button
        disabled={loading}
        on:click={async () => {
          refetching = true;
          await $tableData.refetch();
          refetching = false;
        }}
        style="width: 130px;"
      >
        {#if loading}
          <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
        {:else}
          <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
          Refresh data
        {/if}
      </Button>

      <div style="display: flex;">
        <MenuFlyout alignment="start" placement="bottom" bind:open={viewDropdownOpen}>
          <svelte:fragment slot="flyout">
            <MenuFlyoutItem
              disabled={loading}
              on:click={async () => {
                refetching = true;
                await $tableData.refetch();
                refetching = false;
              }}
            >
              <FluentIcon name="ArrowClockwise16Regular" slot="icon" />
              Refresh data
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            {#if searchBoxValue.includes('archived:true')}
              <MenuFlyoutItem
                indented
                on:click={() => {
                  viewDropdownOpen = false;
                  searchBoxValue = searchBoxValue.replace('archived:true', '');
                  setSearchFilters();
                }}
              >
                Exit {uncapitalize(data.collection.name.plural)} archive
              </MenuFlyoutItem>
            {:else}
              <MenuFlyoutItem
                indented
                on:click={() => {
                  viewDropdownOpen = false;
                  searchBoxValue += 'archived:true';
                  setSearchFilters();
                }}
              >
                View archived {uncapitalize(data.collection.name.plural)}
              </MenuFlyoutItem>
            {/if}
            <MenuFlyoutDivider />
            <MenuFlyoutItem cascading>
              <FluentIcon name="Grid16Regular" slot="icon" />
              Layout
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem
                  indented={viewLayout !== 'grid'}
                  disabled={collectionName !== 'Photo'}
                  on:click={() => {
                    setViewLayout('grid');
                  }}
                >
                  {#if viewLayout === 'grid'}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Thumbnails
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  indented={viewLayout !== 'table'}
                  on:click={() => {
                    setViewLayout('table');
                  }}
                >
                  {#if viewLayout === 'table'}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Details
                </MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutItem cascading>
              <FluentIcon name="PanelRight16Regular" slot="icon" />
              Details pane
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem
                  indented={!detailsPane}
                  on:click={() => {
                    setDetailsPaneEnabled(true);
                  }}
                >
                  {#if !!detailsPane}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Show
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  indented={!!detailsPane}
                  on:click={() => {
                    setDetailsPaneEnabled(false);
                  }}
                >
                  {#if !detailsPane}
                    <FluentIcon name="Checkmark16Regular" slot="icon" />
                  {/if}
                  Hide
                </MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem disabled>
              <FluentIcon name="Filter16Regular" slot="icon" />
              Filter
            </MenuFlyoutItem>
            <MenuFlyoutItem
              on:click={() => {
                viewDropdownOpen = false;
                goto($page.url.pathname);
              }}
            >
              <FluentIcon name="FilterDismiss16Regular" slot="icon" />
              Clear filter
            </MenuFlyoutItem>
          </svelte:fragment>
        </MenuFlyout>
        <Button on:click={() => (viewDropdownOpen = !viewDropdownOpen)}>
          View
          <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
        </Button>
      </div>

      <TextBox
        placeholder="Search this collection"
        type="search"
        spellcheck="false"
        bind:value={searchBoxValue}
        on:keypress={(evt) => {
          if (hasKey(evt, 'key') && evt.key === 'Enter') {
            setSearchFilters();
          }
        }}
        on:search={() => {
          setSearchFilters();
        }}
      />
    </ActionRow>
  </div>

  <UploadFile
    bind:uploadInput
    bind:uploadProgress
    bind:uploadStatus
    bind:loading={uploadLoading}
    tenant={data.tenant}
    refetchData={async () => {
      refetching = true;
      await $tableData.refetch();
      refetching = false;
    }}
  />

  <UploadPhoto
    bind:uploadInput
    bind:uploadProgress
    bind:uploadStatus
    bind:loading={uploadLoading}
    tenant={data.tenant}
    refetchData={async () => {
      refetching = true;
      await $tableData.refetch();
      refetching = false;
    }}
  />

  <div class="explorer">
    {#if viewLayout === 'grid'}
      <div class="grid-layout-wrapper explorer-main">
        <CollectionGrid
          collection={data.collection}
          {tableData}
          schema={data.table.schema}
          tableDataFilter={data.table.filter}
          tableDataSort={data.table.sort}
          photoTemplate={`${server.httpProtocol}//${server.path}/photo/${data.params.tenant}/{{_id}}?tr=w-150`}
          bind:loadingMore
          on:sort={(evt) => {
            // backup the current sort in localstorage so it can be restored later
            localStorage.setItem(`table.${data.collection.schemaName}.sort`, JSON.stringify(evt.detail.new));

            if (JSON.stringify(evt.detail.old) !== JSON.stringify(evt.detail.new)) {
              invalidate('collection-table');
            }
          }}
        />
      </div>
    {:else}
      <div class="new-table-wrapper explorer-main">
        <CollectionTable
          collection={data.collection}
          {tableData}
          schema={data.table.schema}
          tableDataFilter={data.table.filter}
          tableDataSort={data.table.sort}
          bind:loadingMore
          on:sort={(evt) => {
            // backup the current sort in localstorage so it can be restored later
            localStorage.setItem(`table.${data.collection.schemaName}.sort`, JSON.stringify(evt.detail.new));

            if (JSON.stringify(evt.detail.old) !== JSON.stringify(evt.detail.new)) {
              invalidate('collection-table');
            }
          }}
        />
      </div>
    {/if}

    {#if !!detailsPane}
      <div class="explorer-pane">
        <DetailsPane
          totalDocs={$tableData.data?.data?.totalDocs || 0}
          collection={data.collection}
          {tableData}
          schema={data.table.schema}
          photoTemplate={data.collection.schemaName === 'Photo'
            ? `${server.httpProtocol}//${server.path}/photo/${data.params.tenant}/{{_id}}?tr=w-300`
            : ''}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .header :global(.text-box-container) {
    inline-size: auto !important;
    flex-grow: 1;
  }

  .explorer {
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;

    margin: 20px;
    --border-color: var(--color-neutral-light-200);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius);
  }

  @media (prefers-color-scheme: dark) {
    .explorer {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  .explorer > div {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .explorer-main {
    flex-grow: 1;
  }

  .explorer-pane {
    flex-shrink: 0;
  }
</style>
