<script lang="ts">
  import { SidebarHeader } from '$lib/sidebar';
  import type { ComponentProps } from 'svelte';
  import Sidebar from '../../../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/Sidebar.svelte';
  import { richTextParams } from '../richTextParams';

  export let coreSidebarProps: ComponentProps<Sidebar>;

  let headerHeight = 100;
</script>

<div class="header" bind:clientHeight={headerHeight}>
  <SidebarHeader on:click={() => $richTextParams.set('versions', 0)}>Version history</SidebarHeader>
</div>

<div class="wrapper" style="height: calc(100% - {headerHeight}px);">
  <Sidebar
    docInfo={coreSidebarProps.docInfo}
    disabled={coreSidebarProps.disabled}
    ydoc={coreSidebarProps.ydoc}
    stageDef={coreSidebarProps.stageDef}
    sharedData={coreSidebarProps.sharedData}
    awareness={coreSidebarProps.awareness}
    tenant={coreSidebarProps.tenant}
    permissions={coreSidebarProps.permissions}
    hideVersions={coreSidebarProps.hideVersions}
    isEmbedded
    features={{ versions: true }}
  />
</div>

<style>
  .wrapper {
    padding: 4px 12px 12px 12px;
    overflow: auto;
    scroll-behavior: smooth;
    box-sizing: border-box;
  }
</style>
