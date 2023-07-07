<script lang="ts">
  import { SchemaField } from '$lib/common/Field';
  import type Tiptap from '$lib/common/Tiptap/Tiptap.svelte';
  import { SidebarHeader } from '$lib/sidebar';
  import { TextBlock } from 'fluent-svelte';
  import type { ComponentProps } from 'svelte';
  import type { ProcessSchemaDef } from '../../../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/+layout';
  import { richTextParams } from '../richTextParams';

  export let disabled = false;
  export let user: ComponentProps<Tiptap>['user'] | null = null;
  export let processSchemaDef: ProcessSchemaDef | undefined = undefined;
  export let ydoc: ComponentProps<Tiptap>['ydoc'];
  export let wsProvider: ComponentProps<Tiptap>['wsProvider'];

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('props', 0)}>Document properties</SidebarHeader>
</div>

<div class="props-wrapper" style="height: calc(100% - {headerHeight}px);">
  {#if $richTextParams.isActive('fs')}
    {#if processSchemaDef && user}
      {#each processSchemaDef() as [key, def]}
        <SchemaField {key} {def} {ydoc} {disabled} {wsProvider} {user} mode="sidebar" />
      {/each}
    {/if}
  {:else}
    <TextBlock>To view document properties in this pane, enter fullscreen mode.</TextBlock>
  {/if}
</div>

<style>
  .props-wrapper {
    padding: 0 12px 0 12px;
    overflow: auto;
    scroll-behavior: smooth;
  }
</style>
