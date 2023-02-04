<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { FilterChip } from '$lib/common/Chip';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { WorkflowPage } from '$react/CMS/WorkflowPage';
  import { themeMode } from '$stores/themeMode';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, ProgressRing } from 'fluent-svelte';
  import { onMount } from 'svelte';
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
    return arr;
  })();

  let refetching = false;
</script>

<div class="wrapper">
  <div>
    <PageTitle fullWidth>Content Workflow</PageTitle>

    <ActionRow fullWidth>
      <Button
        variant="accent"
        on:click={async () => {
          refetching = true;
          await $workflowComplete.refetch();
          refetching = false;
        }}
        style="width: 130px;"
      >
        {#if refetching}
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

  <react:WorkflowPage data={$workflowComplete.data?.workflow} />
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
