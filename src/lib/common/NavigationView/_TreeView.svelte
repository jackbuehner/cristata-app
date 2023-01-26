<script lang="ts">
  import { page } from '$app/stores';
  import { ListItem, TextBlock } from 'fluent-svelte';
  import { onMount } from 'svelte';
  import FluentIcon from '../FluentIcon.svelte';
  import type { Tree } from './_NavigationTypes';

  export let tree: Tree[] = [];
  export let __depth = 0;
  export let compact = false;

  let treeViewState: any;

  onMount(() => {
    // Check localStorage for an existing treeViewState
    // If none exists, use a blank object string
    treeViewState = JSON.parse(localStorage.getItem('treeViewState') ?? '{}');
  });

  // Utility function for converting regular names to kebab case
  const id = (s: string) => s.toLowerCase().split(' ').join('-');

  // Function for expanding/collapsing docs categories
  function toggleExpansion(event: MouseEvent, name: string) {
    event.stopPropagation();

    // Modify treeViewState to have the opposite of the previous entry for the category
    treeViewState[id(name)] = !treeViewState[id(name)];

    // Update value in localStorage for persistence
    localStorage.setItem('treeViewState', JSON.stringify(treeViewState));
  }

  $: footer = (tree || []).find((tr) => tr.name === 'footer');
</script>

<div class="tree-view">
  {#each (tree || []).filter((tr) => tr.name !== 'footer') as { name, path, type, pages, icon, onClick, selected }}
    {#if name === 'hr'}
      <hr />
    {:else if type === 'category' || type === 'expander'}
      {#if __depth > 0 || type === 'expander'}
        {@const expanded = treeViewState?.[id(name)]}
        <div class="subtree" class:expanded>
          <ListItem
            type="expander"
            {expanded}
            on:click={(e) => {
              // @ts-ignore
              toggleExpansion(e, name);
              onClick?.();
            }}
            style="--depth: {__depth}"
            class="listitem {compact ? 'compact' : ''}"
          >
            <svelte:fragment slot="icon">
              <FluentIcon name={icon || ''} />
            </svelte:fragment>
            {name}
            <svelte:fragment slot="icon-end">
              {#if expanded}
                <FluentIcon name={'ChevronUp12Regular'} />
              {:else}
                <FluentIcon name={'ChevronDown12Regular'} />
              {/if}
            </svelte:fragment>
          </ListItem>
          {#if expanded}
            <div class="subtree-items">
              <svelte:self __depth={__depth + 1} tree={pages} {compact} />
            </div>
          {/if}
        </div>
      {:else}
        <TextBlock class="category-header" variant="bodyStrong">{name}</TextBlock>
        <svelte:self __depth={__depth + 1} tree={pages} {compact} />
      {/if}
    {:else}
      <ListItem
        on:click={() => {
          onClick?.();
        }}
        type="navigation"
        selected={selected || path === $page.url.pathname || path?.slice(0, -1) === $page.url.pathname}
        href={path}
        style="--depth: {__depth}"
        class="listitem {compact ? 'compact' : ''}"
      >
        <svelte:fragment slot="icon">
          <FluentIcon name={icon || ''} />
        </svelte:fragment>
        {@const isScoped = `${name}`.split('::').length === 2}
        {#if isScoped}
          <div class="label-wrapper">
            {name.split('::')[1]}
            <span class="scope">{name.split('::')[0]}</span>
          </div>
        {:else}
          {name}
        {/if}
      </ListItem>
    {/if}
  {/each}
</div>

{#if footer}
  <div class="footer">
    <svelte:self __depth={__depth + 1} tree={footer.pages} {compact} />
  </div>
{/if}

<style>
  /* Add padding to subtrees for the nesting effect */
  .subtree-items :global(.list-item) {
    padding-inline-start: calc((var(--depth, 0) * 32px) + 12px);
  }
  .tree-view {
    max-block-size: 100%;
    min-block-size: 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .tree-view :global(.category-header) {
    inline-size: 100%;
    padding-inline: 16px;
    padding-block: 10px;
  }
  .tree-view :global(.tree-view) {
    flex-grow: 0;
  }
  hr {
    margin: 6px 0;
    border: none;
    border-bottom: 1px solid var(--fds-subtle-fill-secondary);
  }
  .footer {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-bottom: 5px;
  }
  .tree-view :global(.listitem.compact) {
    margin-top: 1px;
    margin-bottom: 1px;
    block-size: 30px;
  }

  .label-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .scope {
    padding: 3px 5px;
    font-family: var(--font-detail);
    font-size: 0.72rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: var(--color-neutral-light-300) 0px 0px 0px 1.25px inset;
    border-radius: var(--radius);
    color: var(--color-neutral-light-1200);
    height: 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  @media (prefers-color-scheme: dark) {
    .scope {
      color: var(--color-neutral-dark-1200);
      box-shadow: var(--color-neutral-dark-300) 0px 0px 0px 1.25px inset;
    }
  }
</style>
