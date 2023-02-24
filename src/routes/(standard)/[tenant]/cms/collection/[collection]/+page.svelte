<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { mongoFilterType } from '$graphql/client';
  import UploadFile from '$lib/cms/UploadFile.svelte';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { CollectionTable } from '$react/CMS/CollectionPage/CollectionTable';
  import { useNewItemModal } from '$react/CMS/CollectionPage/useNewItemModal';
  import { collectionTableActions } from '$stores/collectionTable';
  import { hasKey } from '$utils/hasKey';
  import { isJSON } from '$utils/isJSON';
  import { notEmpty } from '$utils/notEmpty';
  import { uncapitalize } from '$utils/uncapitalize';
  import {
    Button,
    MenuFlyout,
    MenuFlyoutDivider,
    MenuFlyoutItem,
    ProgressRing,
    TextBox,
    Tooltip,
  } from 'fluent-svelte';
  import { hooks } from 'svelte-preprocess-react';
  import type { PageData } from './$types';
  import CollectionTable from './CollectionTable.svelte';

  export let data: PageData;

  $: collectionName = data.collection.schemaName;
  $: collectionNameSingular = uncapitalize(data.collection.name.singular);
  $: collection = data.configuration?.collections?.filter(notEmpty).find((col) => col.name === collectionName);

  $: pageTitle =
    // if defined, attempt to use the page title in the query string
    $page.url.searchParams.get('__pageTitle') ||
    // otherwise, build a title using the collection name
    data.collection.name.plural + ' collection';

  $: if (browser) document.title = `${pageTitle} - Cristata`;

  // build a filter for the table based on url search params
  const defaultFilter: mongoFilterType = { hidden: { $ne: true }, archived: { $ne: true } };
  let mongoFilter = createMongoFilter();
  afterNavigate(() => {
    mongoFilter = createMongoFilter();
  });

  /**
   * Constructs a filter for the collection table that is
   * compatible with the filter query accepted by monogdb.
   */
  function createMongoFilter() {
    const filter = { ...defaultFilter };
    $page.url.searchParams.forEach((value, param) => {
      // ignore values that start with two underscores because these are
      // parameters used in the page instead of filters
      if (param.indexOf('__') === 0) return;

      // if the param name is _search, search the text index
      if (param === '_search') {
        filter.$text = { $search: value };
        return;
      }

      // handle special filters, which are in the format key:filterName:filterValue
      if (value.includes(':') && value.split(':').length === 2) {
        const [filterName, filterValue] = value.split(':');

        if (filterName === 'size') {
          filter[param] = { $size: parseInt(filterValue) || 0 };
          return;
        }

        return;
      }

      const isNegated = param[0] === '!';
      const isArray = isJSON(value) && Array.isArray(JSON.parse(value));

      const parseBooleanString = (str: string) => {
        if (str.toLowerCase() === 'true') return true;
        else if (str.toLowerCase() === 'false') return false;
        return undefined;
      };

      if (isNegated && isArray) filter[param.slice(1)] = { $nin: JSON.parse(value) };
      if (isNegated && !isArray)
        filter[param.slice(1)] = {
          $ne: parseBooleanString(value) !== undefined ? parseBooleanString(value) : parseFloat(value) || value,
        };
      if (!isNegated && isArray) filter[param] = { $in: JSON.parse(value) };
      if (!isNegated && !isArray)
        filter[param] = !isNaN(parseFloat(value))
          ? { $eq: parseFloat(value) }
          : parseBooleanString(value) !== undefined
          ? { $eq: parseBooleanString(value) }
          : { $regex: value, $options: 'i' };
    });
    return filter;
  }

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

  // hook for creating a new item for a collection
  $: newItemModalHookStore = hooks(() => useNewItemModal(collectionName, (url: string) => goto(url)));

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

  // track table items that have been selected
  let selectedIds: string[] = [];
  function setSelectedIds(newValue: string[] | ((selectedIds: string[]) => string[])) {
    if (Array.isArray(newValue)) selectedIds = newValue;
    else selectedIds = newValue(selectedIds);
  }
  let lastSelectedId: string | undefined = undefined;
  function setLastSelectedId(newValue: string | ((lastSelectedId: string | undefined) => string)) {
    if (typeof newValue === 'string') lastSelectedId = newValue;
    else lastSelectedId = newValue(lastSelectedId);
  }

  // check whether the current user is allowed to create a new document
  $: canCreate = $collectionTableActions?.getPermissions() || false;

  // ! temporary
  let loading = false;
  function setLoading(newValue: boolean | ((isLoloadingading: boolean) => boolean)) {
    if (typeof newValue === 'boolean') loading = newValue;
    else loading = newValue(loading);
  }
</script>

<div class="wrapper">
  <div class="header">
    <PageTitle fullWidth>
      {pageTitle}<span style="font-size: 65%; margin-left: 10px;">{uploadStatus || ''}</span>
    </PageTitle>

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
            style="width: 120px;"
          >
            {#if uploadLoading}
              <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
            {:else}
              <FluentIcon name="ArrowUpload16Regular" mode="buttonIconLeft" />
              Upload file
            {/if}
          </Button>
        {:else}
          <Button
            variant="accent"
            disabled={!$newItemModalHookStore || !canCreate || loading || !collection?.canCreateAndGet}
            on:click={() => {
              if ($newItemModalHookStore) $newItemModalHookStore[1]();
            }}
          >
            <FluentIcon name="DocumentAdd16Regular" mode="buttonIconLeft" />
            Create new {collectionNameSingular || 'document'}
          </Button>
        {/if}
      </Tooltip>

      <Button
        disabled={!$collectionTableActions || loading}
        on:click={() => {
          $collectionTableActions?.refetchData();
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
              disabled={!$collectionTableActions || loading}
              on:click={() => {
                $collectionTableActions?.refetchData();
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
    refetchData={async () => $collectionTableActions?.refetchData()}
  />

  <div class="table-wrapper">
    <react:CollectionTable
      collection={collectionName}
      filter={mongoFilter}
      ref={() => {}}
      isLoading={loading}
      setIsLoading={setLoading}
      selectedIdsState={[selectedIds, setSelectedIds]}
      lastSelectedIdState={[lastSelectedId, setLastSelectedId]}
    />
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .header :global(.text-box-container) {
    inline-size: auto !important;
    flex-grow: 1;
  }

  .table-wrapper {
    position: relative;
    padding: 20px;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
    flex-grow: 1;
  }
</style>
