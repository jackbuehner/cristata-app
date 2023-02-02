<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton, ListItem } from 'fluent-svelte';
  import type { MenuItem, Tree } from './_NavigationTypes';
  import TreeView from './_TreeView.svelte';

  export let headerText = '';
  export let menuItems: MenuItem[] = [];
  export let showBackArrow: boolean = false;
  export let hideMenuButton: boolean = false;
  export let compact: boolean = false;
  export let collapsed: boolean = false;

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
    previousPage = from?.url?.pathname || previousPage;
  });
</script>

<aside class:collapsed>
  {#if (!headerText && !hideMenuButton) || showBackArrow}
    <div class="buttonrow">
      {#if showBackArrow}
        <IconButton disabled={!previousPage} on:click={() => history.back()}>
          <FluentIcon name={'ArrowLeft16Regular'} />
        </IconButton>
      {/if}
      {#if !headerText && !hideMenuButton}
        <IconButton on:click={() => (collapsed = !collapsed)}>
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

  <TreeView {tree} {compact} {collapsed}>
    <svelte:fragment slot="internal">
      <slot name="internal" />
    </svelte:fragment>
  </TreeView>
</aside>

<style>
  aside {
    width: 290px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 0;
    transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  aside.collapsed {
    width: 50px;
  }

  span {
    font-weight: 500;
  }

  .buttonrow {
    margin: 3px 5px 3px 9px;
  }
</style>
