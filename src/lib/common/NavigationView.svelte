<script lang="ts">
  import NavigationPane from './NavigationView/_NavigationPane.svelte';
  import type { MenuItem } from './NavigationView/_NavigationTypes';

  export let mode: 'left' = 'left';
  export let headerText = '';
  export let menuItems: MenuItem[] = [];
  export let showBackArrow: boolean = false;
  export let hideMenuButton: boolean = false;
  export let compact: boolean = false;
  export let collapsedPane: boolean = false;
</script>

{#if mode === 'left'}
  <NavigationPane
    {headerText}
    {menuItems}
    {showBackArrow}
    {hideMenuButton}
    {compact}
    bind:collapsed={collapsedPane}
  >
    <svelte:fragment slot="custom">
      <slot name="custom" />
    </svelte:fragment>
    <svelte:fragment slot="internal">
      <slot name="internal" />
    </svelte:fragment>
  </NavigationPane>
{/if}
