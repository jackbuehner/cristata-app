<script lang="ts">
  import { SchemaField } from '$lib/common/Field/index.js';
  import PreviewFrame from '$lib/common/Tiptap/PreviewFrame.svelte';
  import { createYStore } from '$utils/createYStore.js';
  import { getProperty } from '$utils/objectPath.js';
  import { deconstructSchema } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { copy } from 'copy-anything';
  import { Button, InfoBar } from 'fluent-svelte';
  import Sidebar from './Sidebar.svelte';

  export let data;
  $: ({ docData } = data);

  const { collection, item_id, tenant, version_date } = data.params;
  const isOldVersion = !!version_date;

  const deconstructedSchema = copy(data.collection.deconstructedSchema);

  // connect to other clients with yjs for collaborative editing
  const { ydoc, webProvider, wsProvider, awareness, synced, connected, sharedData, fullSharedData } =
    createYStore({
      tenant: data.params.tenant,
      collection: data.collection.schemaName,
      id: item_id,
      user: data.yuser,
      deconstructedSchema: deconstructedSchema,
    });

  // go through the schema and convert JSON types with mutliple fields to individual fields
  const JSONFields = deconstructedSchema.filter(([key, def]) => def.type === 'JSON');

  // push subfields on JSON fields into the schemaDef array
  // so they can appear as regular fields in the UI
  // (subfields are schemaDefs for compatability)
  JSONFields.forEach(([key, def]) => {
    if (def.field?.custom && def.field.custom.length > 0) {
      // find the set of fields that are meant for this specific document
      // by finding a matching name or name === 'default'
      const docName = getProperty($sharedData, data.collection.config.options.nameField || 'name');
      const match =
        def.field.custom.find(({ name }) => name === docName) ||
        def.field.custom.find(({ name }) => name === 'default');

      // push the matching subfields onto the schemaDef variable
      // so that they can appear in the UI
      if (match) {
        const defs = deconstructSchema(match.fields, key);
        deconstructedSchema.push(...defs);
      }

      // and also hide the JSON field since it does not permit user interaction
      def.field.hidden = true;
    }
  });

  $: stageDef = deconstructedSchema.find(([key, def]) => key === 'stage')?.[1];
  $: ({ canPublish, publishLocked, publishStage } = data.helpers.calcPublishPermissions({
    itemStateFields: $sharedData,
    publishActionAccess: docData?.data?.actionAccess.publish || false,
  }));

  $: disabled = isOldVersion || publishLocked || false;

  $: coreSidebarProps = {
    docInfo: {
      _id: `${docData?.data?.doc?.[data.collection.config.by?.one || '_id']}`,
      createdAt: getProperty($sharedData, 'timestamps.created_at'),
      modifiedAt: getProperty($sharedData, 'timestamps.modified_at'),
      collectionName: data.collection.schemaName,
    },
    disabled,
    ydoc,
    stageDef,
    sharedData,
    awareness,
    tenant: data.params.tenant,
    permissions: {
      users:
        getProperty($fullSharedData, 'permissions.users')?.map((user) => ({
          ...user,
          _id: user.value,
          name: user.name || user.label || 'User',
          color: data.helpers.colorHash.hex(user.value || '0'),
        })) || [],
      teams:
        getProperty($fullSharedData, 'permissions.teams')
          ?.filter(notEmpty)
          .map((value) => {
            if (typeof value === 'string') {
              return { _id: value, color: data.helpers.colorHash.hex(value || '0') };
            }
            return {
              _id: value.value,
              label: value.label,
              color: data.helpers.colorHash.hex(value.value || '0'),
            };
          }) || [],
    },
    hideVersions: isOldVersion,
  };

  let tabsContainerElement: HTMLDivElement;
  let activeTab = 'compose';
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

<div class="content-wrapper">
  <div class="document-fields">
    <div style="height: 100%; overflow: auto; display: flex; flex-direction: column;">
      <div style="display: block; flex-grow: 1;">
        <div style="max-width: 800px; padding: 40px; margin: 0px auto;">
          <div class="tabs-container">
            <div class="tabs" bind:this={tabsContainerElement}>
              <Button
                data-tab={'compose'}
                on:click={handleTabClick}
                on:mouseenter={handleTabMouseEnter}
                on:mouseleave={handleTabMouseLeave}
              >
                Compose
              </Button>
              <Button
                data-tab={'preview'}
                on:click={handleTabClick}
                on:mouseenter={handleTabMouseEnter}
                on:mouseleave={handleTabMouseLeave}
              >
                Preview
              </Button>
              <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
            </div>
          </div>

          <div class="alerts-wrapper" class:tabsShown={!!data.collection.config.options.dynamicPreviewHref}>
            {#if isOldVersion}
              <InfoBar
                title="You are currently viewing an old version of this document."
                severity="attention"
                closable={false}
              >
                You cannot make edits.
              </InfoBar>
            {/if}
            {#if !$connected.ws}
              <InfoBar title="Currently not connected." severity="critical" closable={false}>
                If you leave before your connection is restored, you may lose data.
              </InfoBar>
            {/if}
            {#if publishLocked && !isOldVersion}
              <InfoBar
                title="This document is opened in read-only mode because it has been published and you do not
          have publish permissions."
                severity="attention"
                closable={false}
              />
            {/if}
            {#if !!$sharedData.archived && !isOldVersion}
              <InfoBar
                title="This document is opened in read-only mode because it is archived."
                severity="attention"
                closable={false}
              >
                <Button slot="action">Remove from archive</Button>
              </InfoBar>
            {/if}
            {#if !!$sharedData.hidden && !isOldVersion}
              <InfoBar
                title="This document is opened in read-only mode because it is deleted."
                severity="attention"
                closable={false}
              >
                <Button slot="action">Remove from deleted items</Button>
              </InfoBar>
            {/if}
            {#if !!$sharedData._hasPublishedDoc}
              {#if $sharedData.stage === publishStage}
                <InfoBar
                  title="This document is read-only mode because it is published."
                  severity="attention"
                  closable={false}
                >
                  Begin an update session to make edits.
                  <Button slot="action">Begin update session</Button>
                </InfoBar>
              {:else}
                <InfoBar
                  title="You are in an update session for a currently published document."
                  severity="information"
                  closable={false}
                >
                  Your changes will not appear to the public until you publish them.
                </InfoBar>
              {/if}
            {:else if $sharedData.stage === publishStage}
              <InfoBar title="This document is currently published." severity="caution" closable={false}>
                Changes will be publically reflected immediately.
              </InfoBar>
            {/if}
          </div>

          {#if activeTab === 'preview'}
            <PreviewFrame
              src={data.collection.config.options.dynamicPreviewHref}
              {fullSharedData}
              noOuterMargin
            />
          {/if}

          <!-- TODO: move this logic to a special SchemaDefField component that determines the correct -->
          <!-- field based on thnpme schema definition -->
          <!-- The component should have three modes: editor, publish, and create (to support all three cases) -->
          {#each data.helpers.processSchemaDef() as [key, def]}
            <SchemaField
              {key}
              {def}
              {ydoc}
              disabled={disabled || activeTab === 'preview'}
              {wsProvider}
              user={data.yuser}
              processSchemaDef={data.helpers.processSchemaDef}
              {coreSidebarProps}
              {fullSharedData}
              dynamicPreviewHref={data.collection.config.options?.dynamicPreviewHref || undefined}
              style={activeTab === 'preview' ? 'display: none;' : ''}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>
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
  />
</div>

<button
  on:click={() => {
    console.log($ydoc?.toJSON());
  }}
>
  log shared types
</button>

<button
  on:click={() => {
    console.log(docData?.data);
  }}
>
  log doc data
</button>

<pre>
  {JSON.stringify($fullSharedData, null, 2)}
</pre>

<!-- <react:CollectionItemPage {collection} {item_id} {tenant} {version_date} /> -->
<style>
  .content-wrapper {
    display: flex;
    flex-direction: row;
    width: 100%;
    overflow: hidden;
    height: 100%;
    box-sizing: border-box;
  }

  .document-fields {
    min-width: 0;
    overflow: auto;
    flex-grow: 1;
  }

  .alerts-wrapper {
    margin: 0 0 20px 0;
  }
  .alerts-wrapper.tabsShown {
    margin-top: 20px;
  }

  .tabs-container {
    margin-left: -11px;
    width: calc(100% + 22px);
    position: sticky;
    top: 0;
    padding-top: 40px;
    margin-top: -40px;
    background-color: #ffffff;
    z-index: 9;
  }
  @media (prefers-color-scheme: dark) {
    .tabs-container {
      background-color: #272727;
    }
  }

  .tabs {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 30px;
    -webkit-app-region: no-drag;
    app-region: no-drag;
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
    left: 11px;
    width: 58.625px;
    height: 2.4px;
    pointer-events: none;
    position: absolute;
    transition: all 150ms cubic-bezier(0.17, 0.17, 0, 1) 0s;
    float: left;
    background-color: var(--fds-accent-default);
    border-radius: 6px;
  }
</style>
