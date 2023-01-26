<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton, ListItem } from 'fluent-svelte';
  import type { MenuItem, Tree } from './_NavigationTypes';
  import TreeView from './_TreeView.svelte';

  export let headerText = '';
  export let menuItems: MenuItem[] = [];
  export let showBackArrow: boolean = false;
  export let hideMenuButton: boolean = false;
  export let compact: boolean = false;

  function itemMap(item: MenuItem): Tree {
    return {
      name: item.label,
      icon: item.icon,
      path: item.href,
      type: item.type ?? 'navigation',
      pages: item.children?.map(itemMap),
      onClick: item.onClick,
      selected: item.selected ?? false,
    };
  }

  let tree: Tree[];
  $: tree = menuItems.map(itemMap);

  let previousPage: string = '';
  afterNavigate(({ from }) => {
    previousPage = from?.url.pathname || previousPage;
  });
</script>

<aside>
  {#if (!headerText && !hideMenuButton) || showBackArrow}
    <div class="buttonrow">
      {#if showBackArrow}
        <IconButton disabled={!previousPage} on:click={() => history.back()}>
          <FluentIcon name={'ArrowLeft16Regular'} />
        </IconButton>
      {/if}
      {#if !headerText && !hideMenuButton}
        <IconButton>
          <FluentIcon name={'Navigation16Regular'} />
        </IconButton>
      {/if}
    </div>
  {/if}
  {#if headerText && !hideMenuButton}
    <ListItem>
      <svelte:fragment slot="icon">
        <FluentIcon name={'Navigation16Regular'} />
      </svelte:fragment>
      <span>{headerText}</span>
    </ListItem>
  {/if}

  <slot name="custom" />

  <TreeView {tree} {compact} />
</aside>

<style>
  aside {
    width: 280px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 0;
  }

  span {
    font-weight: 500;
  }

  .buttonrow {
    margin: 3px 5px 3px 9px;
  }
</style>
