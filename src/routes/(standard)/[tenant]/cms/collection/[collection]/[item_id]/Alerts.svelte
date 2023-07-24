<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { YStore } from '$utils/createYStore';
  import { Button, InfoBar, ProgressRing } from 'fluent-svelte';
  import type { Action } from './+layout';

  export let isOldVersion: boolean;
  export let connected: YStore['connected'];
  export let publishLocked: boolean;
  export let sharedData: YStore['sharedData'];
  export let actions: Action[];
  export let publishStage: number | undefined;
  export let closable = false;

  export let alertCount = 0;

  $: showOldVersionAlert = isOldVersion;
  $: showDisconnectedAlert = !$connected.ws;
  $: showReadOnlyPublishAlert = publishLocked && !isOldVersion;
  $: showArchivedAlert = !!$sharedData.archived && !isOldVersion;
  $: showHiddenAlert = !!$sharedData.hidden && !isOldVersion;
  $: showUpdateSessionAlert = !!$sharedData._hasPublishedDoc;
  $: showPublishedImmediateChangesAlert = $sharedData.stage === publishStage;

  $: alertCount = [
    showOldVersionAlert,
    showDisconnectedAlert,
    showReadOnlyPublishAlert,
    showArchivedAlert,
    showHiddenAlert,
    showUpdateSessionAlert,
    showPublishedImmediateChangesAlert,
  ].filter((bool) => bool === true).length;
</script>

{#if showOldVersionAlert}
  <InfoBar title="You are currently viewing an old version of this document." severity="attention" {closable}>
    You cannot make edits.
  </InfoBar>
{/if}
{#if showDisconnectedAlert}
  <InfoBar title="Currently not connected." severity="critical" {closable}>
    If you leave before your connection is restored, you may lose data.
  </InfoBar>
{/if}
{#if showReadOnlyPublishAlert}
  <InfoBar
    title="This document is opened in read-only mode because it has been published and you do not
          have publish permissions."
    severity="attention"
    {closable}
  />
{/if}
{#if showArchivedAlert}
  {@const action = actions.find((action) => action.id === 'archive')}
  <InfoBar
    title="This document is opened in read-only mode because it is archived."
    severity="attention"
    {closable}
  >
    {#if action}
      {@const { label, icon, loading, action: onclick, disabled } = action}
      <Button slot="action" disabled={disabled || loading} on:click={disabled ? null : onclick}>
        {#if loading}
          <div class="button-progress"><ProgressRing size={16} /></div>
        {/if}
        <FluentIcon name={icon} mode="buttonIconLeft" style={loading ? 'visibility: hidden;' : ''} />
        <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">
          {label}
        </span>
      </Button>
    {/if}
  </InfoBar>
{/if}
{#if showHiddenAlert}
  {@const action = actions.find((action) => action.id === 'delete')}
  <InfoBar
    title="This document is opened in read-only mode because it is deleted."
    severity="attention"
    {closable}
  >
    {#if action}
      {@const { label, icon, loading, action: onclick, disabled } = action}
      <Button slot="action" disabled={disabled || loading} on:click={disabled ? null : onclick}>
        {#if loading}
          <div class="button-progress"><ProgressRing size={16} /></div>
        {/if}
        <FluentIcon name={icon} mode="buttonIconLeft" style={loading ? 'visibility: hidden;' : ''} />
        <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">
          {label}
        </span>
      </Button>
    {/if}
  </InfoBar>
{/if}
{#if showUpdateSessionAlert}
  {#if $sharedData.stage === publishStage}
    {@const action = actions.find((action) => action.id === 'updateSession')}
    <InfoBar title="This document is read-only mode because it is published." severity="attention" {closable}>
      Begin an update session to make edits.
      {#if action}
        {@const { label, icon, loading, action: onclick, disabled } = action}
        <Button slot="action" disabled={disabled || loading} on:click={disabled ? null : onclick}>
          {#if loading}
            <div class="button-progress"><ProgressRing size={16} /></div>
          {/if}
          <FluentIcon name={icon} mode="buttonIconLeft" style={loading ? 'visibility: hidden;' : ''} />
          <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">
            {label}
          </span>
        </Button>
      {/if}
    </InfoBar>
  {:else}
    <InfoBar
      title="You are in an update session for a currently published document."
      severity="information"
      {closable}
    >
      Your changes will not appear to the public until you publish them.
    </InfoBar>
  {/if}
{:else if showPublishedImmediateChangesAlert}
  <InfoBar title="This document is currently published." severity="caution" {closable}>
    Changes will be publically reflected immediately.
  </InfoBar>
{/if}

<style>
  .button-progress {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
</style>
