<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { Button, IconButton, MenuFlyout, MenuFlyoutDivider, MenuFlyoutItem } from 'fluent-svelte';
  import HomeTabPanel from './tabpanels/HomeTabPanel.svelte';
  import InsertTabPanel from './tabpanels/InsertTabPanel.svelte';
  import LayoutTabPanel from './tabpanels/LayoutTabPanel.svelte';
  import ReviewTabPanel from './tabpanels/ReviewTabPanel.svelte';
  import TableTabPanel from './tabpanels/TableTabPanel.svelte';

  export let fullscreen = false;

  let tabsContainerElement: HTMLDivElement;
  let activeTab = 'home';
  let mouseOverActiveTab = false;
  $: ({ activeTabWidth, activeTabLeft } = (() => {
    const tabsContainerRect = tabsContainerElement?.getBoundingClientRect();
    const activeTabRect = tabsContainerElement
      ?.querySelector(`[data-tab='${activeTab}']`)
      ?.getBoundingClientRect();
    return {
      activeTabWidth: (activeTabRect?.width || 0) - (mouseOverActiveTab ? 0 : 22),
      activeTabLeft:
        (activeTabRect?.left || 0) - (tabsContainerRect?.left || 0) + (mouseOverActiveTab ? 0 : 11),
    };
  })());

  function handleTabClick(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const clickedTabName = target?.getAttribute('data-tab');
    if (clickedTabName) {
      activeTab = clickedTabName;
      mouseOverActiveTab = true;
    }
  }

  function handleTabMouseEnter(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = true;
    else mouseOverActiveTab = false;
  }

  function handleTabMouseLeave(evt: CustomEvent) {
    const target = evt.target as HTMLElement | undefined;
    const tabName = target?.getAttribute('data-tab');
    if (tabName === activeTab) mouseOverActiveTab = false;
    else mouseOverActiveTab = false;
  }
</script>

<div class="ribbon">
  <div style="padding: 0 8px;">
    <div class="top">
      <div class="tabs" bind:this={tabsContainerElement}>
        <MenuFlyout alignment="start" placement="bottom" offset={0}>
          <Button>File</Button>
          <svelte:fragment slot="flyout">
            <MenuFlyoutItem hint="Ctrl + S">
              <FluentIcon name="Save20Regular" />
              Save
            </MenuFlyoutItem>
            <MenuFlyoutItem hint="Ctrl + Shift + S">
              <FluentIcon name="CloudArrowUp20Regular" />
              Publish
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem hint="Ctrl + P">
              <FluentIcon name="Print20Regular" />
              Print
            </MenuFlyoutItem>
            <MenuFlyoutItem cascading>
              <FluentIcon name="ArrowExportUp20Regular" />
              Export
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem>JavaScript Object Notation (.json)</MenuFlyoutItem>
                <MenuFlyoutItem>Web Page (.html)</MenuFlyoutItem>
                <MenuFlyoutItem>Email-ready HTML (.html)</MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutItem>
              <FluentIcon name="Share20Regular" />
              Share
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem>
              <FluentIcon name="Eye20Regular" />
              Watch
            </MenuFlyoutItem>
            <MenuFlyoutItem>
              <FluentIcon name="Delete20Regular" />
              Delete
            </MenuFlyoutItem>
            <MenuFlyoutItem>
              <FluentIcon name="Archive20Regular" />
              Archive
            </MenuFlyoutItem>
            <MenuFlyoutItem>
              <FluentIcon name="DocumentMultiple20Regular" />
              Duplicate
            </MenuFlyoutItem>
          </svelte:fragment>
        </MenuFlyout>
        <Button
          data-tab={'home'}
          on:click={handleTabClick}
          on:mouseenter={handleTabMouseEnter}
          on:mouseleave={handleTabMouseLeave}
        >
          Home
        </Button>
        <Button
          data-tab={'insert'}
          on:click={handleTabClick}
          on:mouseenter={handleTabMouseEnter}
          on:mouseleave={handleTabMouseLeave}
        >
          Insert
        </Button>
        <Button
          data-tab={'layout'}
          on:click={handleTabClick}
          on:mouseenter={handleTabMouseEnter}
          on:mouseleave={handleTabMouseLeave}
        >
          Layout
        </Button>
        <Button
          data-tab={'review'}
          on:click={handleTabClick}
          on:mouseenter={handleTabMouseEnter}
          on:mouseleave={handleTabMouseLeave}
        >
          Review
        </Button>
        <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
      </div>
      <div class="focuszone">
        {#if $page.url.searchParams.get('fs') === '1'}
          <IconButton
            on:click={() => {
              const url = new URL($page.url);
              url.searchParams.set('fs', '0');
              goto(url);
            }}
          >
            <FluentIcon name="ArrowMinimize20Regular" />
          </IconButton>
        {:else if $page.url.searchParams.get('fs') !== 'force'}
          <IconButton
            on:click={() => {
              const url = new URL($page.url);
              url.searchParams.set('fs', '1');
              goto(url);
            }}
          >
            <FluentIcon name="ArrowMaximize20Regular" />
          </IconButton>
        {/if}
      </div>
    </div>
  </div>
  <div class="tabpanel">
    <HomeTabPanel visible={activeTab === 'home'} />
    <InsertTabPanel visible={activeTab === 'insert'} />
    <LayoutTabPanel visible={activeTab === 'layout'} />
    <ReviewTabPanel visible={activeTab === 'review'} />
    <TableTabPanel visible={activeTab === 'table'} />
  </div>
</div>

<style>
  .ribbon {
    width: 100%;
    background-color: var(--titlebar-bg);
    user-select: none;
  }

  .top {
    display: flex;
    justify-content: space-between;
    white-space: nowrap;
    height: 36px;
    position: relative;
    margin-top: 4px;
  }

  .tabpanel {
    height: 40px;
    background-color: var(--fds-solid-background-quarternary);
    color: var(--fds-text-primary);
    border-bottom: none;
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.133) 0px 1.6px 3.6px 0px, rgba(0, 0, 0, 0.11) 0px 0.3px 0.9px 0px;
    z-index: 2;
    position: relative;
    display: flex;
    justify-content: left;
    /* overflow: hidden; */
    --tabpanelmargin: 8px;
    margin: 0 var(--tabpanelmargin);
    width: calc(100% - (2 * var(--tabpanelmargin)));
  }

  .tabpanel :global(.panel) {
    display: flex;
    justify-content: left;
    align-items: center;
    --margin: 4px;
    margin: var(--margin);
    visibility: visible;
    width: calc(100% - (2 * var(--margin)));
    height: 32px;
    transform: translateX(-20px);
    opacity: 0;
    transition: transform 0.15s ease 0s;
    white-space: nowrap;
    flex-wrap: nowrap;
    align-content: flex-start;

    position: absolute;
    left: 0;
    box-sizing: border-box;
  }

  .tabpanel :global(.panel.visible) {
    visibility: visible;
    transform: none;
    opacity: 100;
    z-index: 1;
    transition: transform 0.15s ease 0s, opacity 0.15s ease 0s;
  }

  .tabpanel :global(.panel > .button) {
    height: 32px;
    background-color: transparent !important;
    box-shadow: none;
  }

  .tabpanel :global(.panel > .icon-button) {
    width: 32px;
    height: 32px;
  }

  .tabpanel :global(.panel > span.bar) {
    display: inline-flex;
    height: 24px;
    align-items: center;
    margin: 4px 4px;
    width: 1px;
    background-color: var(--fds-control-strong-fill-disabled);
    opacity: 0.6;
  }
  @media (resolution: 144dpi) {
    .tabpanel :global(.panel > span.bar) {
      width: 0.67px;
    }
  }

  .tabpanel :global(.panel > .button):hover,
  .tabpanel :global(.panel > .icon-button):hover {
    background-color: var(--fds-subtle-fill-secondary) !important;
  }

  .tabpanel :global(.panel > .button):active,
  .tabpanel :global(.panel > .icon-button):active {
    background-color: var(--fds-subtle-fill-tertiary) !important;
    color: var(--fds-text-secondary);
  }

  .tabs {
    position: relative;
  }

  .tabs :global(.button.style-standard) {
    background-color: transparent;
    box-shadow: none;
  }

  .tabs :global(.button.style-standard):hover {
    background-color: var(--fds-subtle-fill-secondary);
  }

  .tabs :global(.button.style-standard):active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  .tabline {
    margin: 0px;
    bottom: 5px;
    left: 111.573px;
    width: 41.3646px;
    height: 3px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }
</style>
