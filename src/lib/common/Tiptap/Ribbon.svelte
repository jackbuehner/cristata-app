<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import SaveDocumentDialog from '$lib/dialogs/SaveDocumentDialog.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, MenuFlyout, MenuFlyoutDivider, MenuFlyoutItem } from 'fluent-svelte';
  import type { tiptapOptions } from '../../../config';
  import HomeTabPanel from './tabpanels/HomeTabPanel.svelte';
  import InsertTabPanel from './tabpanels/InsertTabPanel.svelte';
  import LayoutTabPanel from './tabpanels/LayoutTabPanel.svelte';
  import PhotoTabPanel from './tabpanels/PhotoTabPanel.svelte';
  import PullQuoteTabPanel from './tabpanels/PullQuoteTabPanel.svelte';
  import ReviewTabPanel from './tabpanels/ReviewTabPanel.svelte';
  import TableTabPanel from './tabpanels/TableTabPanel.svelte';
  import ViewTabPanel from './tabpanels/ViewTabPanel.svelte';
  import YoutubeTabPanel from './tabpanels/YoutubeTabPanel.svelte';

  export let editor: Editor | null;
  export let options: tiptapOptions | undefined = undefined;

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

  function setTab(tabName: string) {
    activeTab = tabName;
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

  let width = 1000;

  let fileMenuOpen = false;
  let saveDocDialogOpen = false;
</script>

<div class="ribbon" bind:offsetWidth={width}>
  <div style="padding: 0 8px;">
    <div class="top">
      <div class="tabs" bind:this={tabsContainerElement}>
        <MenuFlyout alignment="start" placement="bottom" offset={0} bind:open={fileMenuOpen}>
          <svelte:fragment slot="flyout">
            <MenuFlyoutItem hint="Ctrl + S" on:click={() => (saveDocDialogOpen = !saveDocDialogOpen)}>
              <FluentIcon name="Save20Regular" />
              Save
            </MenuFlyoutItem>
            <MenuFlyoutItem hint="Ctrl + Shift + S" disabled>
              <FluentIcon name="CloudArrowUp20Regular" />
              Publish
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem hint="Ctrl + P" disabled>
              <FluentIcon name="Print20Regular" />
              Print
            </MenuFlyoutItem>
            <MenuFlyoutItem cascading disabled>
              <FluentIcon name="ArrowExportUp20Regular" />
              Export
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem>JavaScript Object Notation (.json)</MenuFlyoutItem>
                <MenuFlyoutItem>Web Page (.html)</MenuFlyoutItem>
                <MenuFlyoutItem>Email-ready HTML (.html)</MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutItem disabled>
              <FluentIcon name="Share20Regular" />
              Share
            </MenuFlyoutItem>
            <MenuFlyoutDivider />
            <MenuFlyoutItem disabled>
              <FluentIcon name="Eye20Regular" />
              Watch
            </MenuFlyoutItem>
            <MenuFlyoutItem disabled>
              <FluentIcon name="Delete20Regular" />
              Delete
            </MenuFlyoutItem>
            <MenuFlyoutItem disabled>
              <FluentIcon name="Archive20Regular" />
              Archive
            </MenuFlyoutItem>
            <MenuFlyoutItem disabled>
              <FluentIcon name="DocumentMultiple20Regular" />
              Duplicate
            </MenuFlyoutItem>
          </svelte:fragment>
        </MenuFlyout>
        <Button on:click={() => (fileMenuOpen = !fileMenuOpen)}>File</Button>
        {#if width > 400}
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
          <Button
            data-tab={'view'}
            on:click={handleTabClick}
            on:mouseenter={handleTabMouseEnter}
            on:mouseleave={handleTabMouseLeave}
          >
            View
          </Button>
          {#if editor?.isActive('youtubeWidget')}
            <Button
              data-tab="youtube"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              YouTube
            </Button>
          {/if}
          {#if editor?.isActive('photoWidget')}
            <Button
              data-tab="photo"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              Photo
            </Button>
          {/if}
          {#if editor?.isActive('pullQuote')}
            <Button
              data-tab="pullQuote"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              Pull Quote
            </Button>
          {/if}
          {#if editor?.can().deleteTable()}
            <Button
              data-tab="table"
              data-contextual="true"
              on:click={handleTabClick}
              on:mouseenter={handleTabMouseEnter}
              on:mouseleave={handleTabMouseLeave}
            >
              Table
            </Button>
          {/if}
          <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
        {/if}
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
  {#if width > 400}
    <div class="tabpanel">
      <HomeTabPanel visible={activeTab === 'home'} {editor} {options} />
      <InsertTabPanel visible={activeTab === 'insert'} {editor} {options} />
      <LayoutTabPanel visible={activeTab === 'layout'} {editor} {options} />
      <ReviewTabPanel visible={activeTab === 'review'} {editor} {options} />
      <ViewTabPanel visible={activeTab === 'view'} {editor} {options} />
      <TableTabPanel visible={activeTab === 'table'} {editor} {options} {setTab} />
      <YoutubeTabPanel visible={activeTab === 'youtube'} {editor} {setTab} />
      <PhotoTabPanel visible={activeTab === 'photo'} {editor} {setTab} />
      <PullQuoteTabPanel visible={activeTab === 'pullQuote'} {editor} {setTab} />
    </div>
  {/if}
</div>

<SaveDocumentDialog bind:open={saveDocDialogOpen} />

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
    gap: 4px;
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

  .tabpanel :global(.panel > .button),
  .tabpanel :global(.panel > .tooltip-wrapper > .button) {
    height: 32px;
    background-color: transparent !important;
    box-shadow: none;
  }

  .tabpanel :global(.panel > .icon-button),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button) {
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

  .tabpanel {
    --mouse-hover: #e1dfdd;
    --mouse-active: #c8c6c4;
    --tool-active: #d2d0ce;
    --tool-active-hover: #979593;
  }
  @media (prefers-color-scheme: dark) {
    .tabpanel {
      --mouse-hover: #484644;
      --mouse-active: #797775;
      --tool-active: #605e5c;
      --tool-active-hover: #8a8886;
    }
  }

  .tabpanel :global(.panel > .button.active),
  .tabpanel :global(.panel > .icon-button.active),
  .tabpanel :global(.panel > .tooltip-wrapper > .button.active),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.active) {
    background-color: var(--tool-active) !important;
    background-color: var(--mouse-hover) !important;
  }

  .tabpanel :global(.panel > .button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button.active):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.active):hover:not(disabled):not(.disabled) {
    box-shadow: inset 0 0 0 1px var(--tool-active-hover);
  }

  .tabpanel :global(.panel > .button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button):hover:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button):hover:not(disabled):not(.disabled) {
    background-color: var(--mouse-hover) !important;
  }

  .tabpanel :global(.panel > .button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .icon-button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .button):active:not(disabled):not(.disabled),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button):active:not(disabled):not(.disabled) {
    background-color: var(--mouse-active) !important;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .button.style-standard),
  .tabpanel :global(.panel > .button.style-standard) {
    padding-left: 6px;
    padding-right: 6px;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button),
  .tabpanel :global(.panel > .icon-button) {
    padding: 6px;
  }
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button svg),
  .tabpanel :global(.panel > .icon-button svg) {
    inline-size: 18px;
  }

  .tabpanel :global(.panel > .tooltip-wrapper > .button.disabled svg),
  .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.disabled svg),
  .tabpanel :global(.panel > .button.disabled svg),
  .tabpanel :global(.panel > .icon-button.disabled svg) {
    fill: #3a3a38ff;
    opacity: 0.4;
  }
  @media (prefers-color-scheme: dark) {
    .tabpanel :global(.panel > .tooltip-wrapper > .button.disabled svg),
    .tabpanel :global(.panel > .tooltip-wrapper > .icon-button.disabled svg),
    .tabpanel :global(.panel > .button.disabled svg),
    .tabpanel :global(.panel > .icon-button.disabled svg) {
      fill: #d4d4d4ff;
    }
  }

  .tabpanel :global(.panel > .menu-flyout-wrapper) {
    margin-right: -4px;
    height: 32px;
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
  }

  .tabs :global(.button.style-standard) {
    background-color: transparent;
    box-shadow: none;
    padding-left: 11px;
    padding-right: 11px;
  }

  .tabs :global(.button.style-standard):hover:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-secondary);
  }

  .tabs :global(.button.style-standard):active:not(disabled):not(.disabled) {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  .tabs :global(.button.style-standard[data-contextual='true']) {
    color: var(--fds-accent-default);
  }

  .tabline {
    margin: 0px;
    bottom: 0px;
    left: 111.573px;
    width: 41.3646px;
    height: 2.4px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }
</style>
