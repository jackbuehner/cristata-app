<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { BoardCard, BoardColumn, BoardWrapper } from '$lib/common/Board';
  import { FilterChip } from '$lib/common/Chip';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { useNewItemModal } from '$react/CMS/CollectionPage/useNewItemModal';
  import { motionMode } from '$stores/motionMode';
  import { themeMode } from '$stores/themeMode';
  import { camelToDashCase } from '$utils/camelToDashCase';
  import { notEmpty } from '$utils/notEmpty';
  import { deconstructSchema } from '@jackbuehner/cristata-generator-schema';
  import { Button, MenuFlyout, MenuFlyoutItem, ProgressRing } from 'fluent-svelte';
  import pluralize from 'pluralize';
  import { onMount } from 'svelte';
  import { hooks } from 'svelte-preprocess-react';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ workflowComplete } = data);

  onMount(() => {
    document.title = 'Content Workflow - Cristata';
  });

  let showFilters = $page.url.searchParams.has('showFilters')
    ? $page.url.searchParams.get('showFilters') === 'true'
    : true;

  // get an array of the collection that are included in the returned workflow data
  let lastIncluded: string[] = [];
  $: includedCollections = (() => {
    if ($workflowComplete?.data) {
      const included = ($workflowComplete?.data?.workflow || []).filter(notEmpty).reduce((arr, col) => {
        const foundCols = col.docs.filter(notEmpty).reduce((arr, doc) => {
          if (!arr.includes(doc.in)) arr.push(doc.in);
          return arr;
        }, [] as string[]);
        arr.push(...foundCols);
        return Array.from(new Set(arr));
      }, [] as string[]);
      lastIncluded = included;
      return included;
    }
    return lastIncluded;
  })();

  $: excluded = (() => {
    const arr: string[] = [];
    $page.url.searchParams.forEach((value) => {
      arr.push(...value.replace('[', '').replace(']', '').split(','));
    });
    return arr.filter((v) => v !== 'true');
  })();

  // hooks for creating a new item for a collection
  $: newItemModalHooksStore = hooks(() => {
    const obj: Record<string, ReturnType<typeof useNewItemModal>> = {};

    data.configuration?.collections?.filter(notEmpty).forEach((col) => {
      if (col.name === 'Photo') return;
      if (col.name === 'File') return;
      if (col.name === 'Activity') return;
      if (col.pluralLabel === '__hidden') return;
      if (!col.canCreateAndGet) return;
      obj[col.name] = useNewItemModal(col.name, (url: string) => goto(url));
    });

    return obj;
  });

  let refetching = false;
  let createDropdownOpen = false;

  $: workflow = $workflowComplete.data?.workflow?.filter(notEmpty) || [];
</script>

<div class="wrapper">
  <div>
    <PageTitle fullWidth>Content Workflow</PageTitle>

    <ActionRow fullWidth>
      <div style="display: flex;">
        <MenuFlyout alignment="start" placement="bottom" bind:open={createDropdownOpen}>
          <svelte:fragment slot="flyout">
            {#if $newItemModalHooksStore}
              {#each Object.entries($newItemModalHooksStore).sort( (a, b) => a[0].localeCompare(b[0]) ) as [collectionName, [_, showModal]]}
                {@const collectionNameSingular = pluralize.singular(
                  camelToDashCase(collectionName).replaceAll('-', ' ')
                )}
                <MenuFlyoutItem disabled={!showModal} on:click={() => showModal()}>
                  New {collectionNameSingular}
                </MenuFlyoutItem>
              {/each}
            {/if}
          </svelte:fragment>
        </MenuFlyout>
        <Button variant="accent" on:click={() => (createDropdownOpen = !createDropdownOpen)}>
          Create new document
          <FluentIcon name="ChevronDown16Regular" mode="buttonIconRight" />
        </Button>
      </div>

      <Button
        disabled={$workflowComplete.loading}
        on:click={async () => {
          await $workflowComplete.refetch();
        }}
        style="width: 130px;"
      >
        {#if $workflowComplete.loading}
          <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
        {:else}
          <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
          Refresh data
        {/if}
      </Button>

      <Button
        on:click={() => {
          showFilters = !showFilters;
          $page.url.searchParams.set('showFilters', `${showFilters}`);
          goto($page.url, { replaceState: true });
        }}
      >
        <FluentIcon name="Filter16Regular" mode="buttonIconLeft" />
        {#if showFilters}
          Hide collection filters
        {:else}
          Show collection filters
        {/if}
      </Button>
    </ActionRow>

    {#if showFilters}
      <div class="filter-row">
        {#each (data.configuration?.collections?.filter(notEmpty) || [])
          .filter((col) => includedCollections.includes(col.name) || excluded.includes(col.name))
          .sort((a, b) => (b.pluralLabel || b.name).localeCompare(a.pluralLabel || a.name))
          .sort((col) => (excluded.includes(col.name) ? 1 : -1)) as col}
          {#if excluded.includes(col.name)}
            <FilterChip
              color={{ name: $themeMode === 'light' ? 'red' : 'orange' }}
              on:click={() => {
                $page.url.searchParams.set(
                  'exclude',
                  `[${excluded.filter((colName) => colName !== col.name).join(',')}]`
                );
                goto($page.url, { replaceState: true, invalidateAll: true });
                $workflowComplete.refetch();
              }}
              scope="Excluded"
              icon="Add16Regular"
            >
              {col.pluralLabel}
            </FilterChip>
          {:else}
            <FilterChip
              color={{ name: 'green' }}
              on:click={() => {
                $page.url.searchParams.set('exclude', `[${[...excluded, col.name].join(',')}]`);
                goto($page.url, { replaceState: true, invalidateAll: true });
                $workflowComplete.refetch();
              }}
            >
              {col.pluralLabel}
            </FilterChip>
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <BoardWrapper columns={4}>
    {#each [workflow.find((group) => group._id === 1) || { _id: 1, count: 0, docs: [] }, workflow.find((group) => group._id === 2) || { _id: 2, count: 0, docs: [] }, workflow.find((group) => group._id === 3) || { _id: 3, count: 0, docs: [] }, workflow.find((group) => group._id === 4) || { _id: 4, count: 0, docs: [] }] as group}
      <BoardColumn
        title={group._id === 1
          ? 'Planning'
          : group._id === 2
          ? 'Draft'
          : group._id === 3
          ? 'In review'
          : 'Ready'}
      >
        {#each group.docs.filter(notEmpty) || [] as doc}
          {@const collection = data.configuration?.collections
            ?.filter(notEmpty)
            .find((col) => col.name === doc.in)}
          {@const deconstructedSchema = deconstructSchema(JSON.parse(collection?.schemaDef || '{}'))}

          {@const pluralLabel = collection?.pluralLabel}

          {@const defaultColor = (() => {
            if (parseInt(`${doc.stage}`) === 1) return 'indigo';
            if (parseInt(`${doc.stage}`) === 2) return 'orange';
            if (parseInt(`${doc.stage}`) === 3) return 'red';
            if (parseInt(`${doc.stage}`) === 4) return 'blue';
            return 'neutral';
          })()}

          {@const stageChips = deconstructedSchema.find(([key]) => key === 'stage')?.[1].column?.chips}
          {@const stageChip =
            stageChips && Array.isArray(stageChips)
              ? stageChips.find((chip) => chip.value === doc.stage) || { value: doc.stage }
              : { value: doc.stage }}

          {@const shouldOpenMaximized = !!deconstructedSchema.find(
            ([key, def]) => key === 'body' && def.field?.tiptap
          )}

          {@const canAccessById = collection?.by?.one === '_id'}
          {@const itemQueryString = shouldOpenMaximized ? '?fs=1&props=1' : ''}
          {@const href = canAccessById
            ? `${data.tenant}/cms/collection/${camelToDashCase(doc.in)}/${doc._id}${itemQueryString}`
            : undefined}

          <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
            <BoardCard
              label={pluralLabel}
              chip={{ value: stageChip.value, label: stageChip.label, color: stageChip.color || defaultColor }}
              {href}
            >
              {doc.name}
            </BoardCard>
          </div>
        {/each}
      </BoardColumn>
    {/each}
  </BoardWrapper>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;
  }

  .filter-row {
    margin: -10px 0 20px 0;
    padding: 0 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
</style>
