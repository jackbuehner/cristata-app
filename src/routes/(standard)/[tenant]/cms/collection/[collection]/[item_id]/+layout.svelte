<script lang="ts">
  import { FieldWrapper, SchemaField } from '$lib/common/Field/index.js';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import PreviewFrame from '$lib/common/Tiptap/PreviewFrame.svelte';
  import PublishDocDialog from '$lib/dialogs/PublishDocDialog.svelte';
  import SaveDocumentDialog from '$lib/dialogs/SaveDocumentDialog.svelte';
  import ShareDocDialog from '$lib/dialogs/ShareDocDialog.svelte';
  import { motionMode } from '$stores/motionMode';
  import { title } from '$stores/title';
  import { createYStore } from '$utils/createYStore.js';
  import { getProperty } from '$utils/objectPath.js';
  import { deconstructSchema } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { copy } from 'copy-anything';
  import { Button, InfoBar, ProgressRing, TextBlock } from 'fluent-svelte';
  import { merge } from 'merge-anything';
  import { toast } from 'react-toastify';
  import { onDestroy, onMount } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { derived } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import type { Action } from './+layout';
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
      versionDate: version_date,
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
  $: ({ canPublish, publishLocked, publishStage, currentStage } = data.helpers.calcPublishPermissions({
    itemStateFields: $sharedData,
    publishActionAccess: $docData.data?.actionAccess.publish || false,
  }));

  $: hasLoadedAtLeastOnce = JSON.stringify($sharedData) !== JSON.stringify({});

  // construct the name field with the field provied
  $: docName = (() => {
    let docName = data.collection.config.options.nameField || data.collection.name.singular;

    if (data.collection.config.options.nameField?.includes('%')) {
      const schemaKeys = data.collection.deconstructedSchema
        .filter(([, def]) => def.type === 'String' || def.type === 'Number' || def.type === 'Float')
        .map(([key]) => key);

      for (const key of schemaKeys) {
        if (docName.includes(`%${key}%`)) {
          docName = docName.replaceAll(`%${key}%`, getProperty($sharedData, key));
        }
      }
    } else {
      docName = getProperty($sharedData, data.collection.config.options.nameField || 'name') || docName;
    }

    if (docName.includes('undefined')) docName = data.collection.name.singular;

    return docName;
  })();

  // calculate the document title
  $: pageTitle = (() => {
    let title = '';

    // show document name in the title
    title += docName;

    // show written note about unsaved status
    // if (isLoading) title += ' - Syncing';

    return title;
  })();

  $: title.set(pageTitle);
  onDestroy(() => {
    title.set('');
  });

  $: watcherData = data.helpers.calcWatching($sharedData);

  $: archived = !!$sharedData.archived;
  $: locked = !!$sharedData.locked;
  $: hidden = !!$sharedData.hidden;
  $: loading = false;
  $: hasPublishedDoc = !!$sharedData._hasPublishedDoc;
  $: disconnected = !$connected.ws;
  $: disabled =
    isOldVersion || publishLocked || archived || locked || hidden || loading || disconnected || false;

  $: docHasUnrestrictedAccess =
    data.collection.config.withPermissions === false ||
    getProperty(data, 'permissions.teams')?.includes('000000000000000000000000') ||
    getProperty(data, 'permissions.users')?.includes('000000000000000000000000');

  $: publishDialogDisabled =
    isOldVersion || canPublish !== true || archived || locked || hidden || loading || disconnected;
  $: shareDialogDisabled =
    isOldVersion ||
    $docData.data?.actionAccess?.modify !== true ||
    archived ||
    locked ||
    hidden ||
    loading ||
    disconnected ||
    docHasUnrestrictedAccess;
  $: watchActionDisabled =
    watcherData.isMandatoryWatcher || $docData.data?.actionAccess?.watch !== true || disabled;

  let publishDialogOpen = false;
  let shareDialogOpen = false;
  let showCollapsedFields = false;
  let showHiddenFields = false;
  let saveDocDialogOpen = false;

  let actions: Action[] = [];
  let loadingWatchAction = false;
  let loadingHideAction = false;
  let loadingArchiveAction = false;
  let loadingCloneAction = false;
  let loadingUpdateSessionAction = false;
  let loadingPublishAction = false;
  $: actions = [
    {
      id: 'save',
      label: 'Save',
      icon: 'Save20Regular',
      action: async () => {
        saveDocDialogOpen = !saveDocDialogOpen;
      },
      disabled: disabled,
      hint: 'Ctrl + S',
    },
    {
      id: 'watch',
      label: watcherData.isWatcher ? 'Stop watching' : 'Watch',
      icon: watcherData.isWatcher ? 'EyeOff20Regular' : 'Eye24Regular',
      action: async () => {
        loadingWatchAction = true;
        const error = await data.actions.toggleWatchDoc(!watcherData.isWatcher);
        if (error) toast.error(error);
        setTimeout(() => {
          loadingWatchAction = false;
        }, 1000);
      },
      loading: loadingWatchAction,
      disabled: loadingWatchAction || watchActionDisabled,
      tooltip: watcherData.isMandatoryWatcher
        ? `You cannot stop watching this document because you are in one of the following groups: ${watcherData.mandatoryWatchersKeys.join(
            ', '
          )}`
        : undefined,
      hint: 'Ctrl + Shift + F',
    },
    {
      id: 'publish',
      label: currentStage === publishStage ? 'Unpublish' : hasPublishedDoc ? 'Republish' : 'Publish',
      type: 'button',
      icon: currentStage === publishStage ? 'CloudDismiss24Regular' : 'CloudArrowUp24Regular',
      action: async () => {
        if (currentStage === publishStage) {
          loadingPublishAction = true;
          await data.actions.unpublishDoc();
          setTimeout(() => {
            loadingPublishAction = false;
          }, 1000);
        } else {
          publishDialogOpen = !publishDialogOpen;
        }
      },
      loading: loadingPublishAction,
      disabled: loadingPublishAction || publishDialogDisabled,
      tooltip:
        canPublish !== true
          ? `You cannot publish this document because you do not have permission.`
          : undefined,
      hint: 'Ctrl + Shift + P',
    },
    {
      id: 'delete',
      label: hidden ? 'Restore from deleted items' : 'Delete',
      type: 'button',
      icon: hidden ? 'DeleteOff24Regular' : 'Delete24Regular',
      action: async () => {
        loadingHideAction = true;
        await data.actions.hideDoc(!hidden);
        setTimeout(() => {
          loadingHideAction = false;
        }, 1000);
      },
      loading: loadingHideAction,
      disabled:
        loadingHideAction ||
        isOldVersion ||
        $docData.data?.actionAccess?.hide !== true ||
        locked ||
        loading ||
        disconnected,
    },
    {
      id: 'archive',
      label: archived ? 'Remove from archive' : 'Archive',
      type: 'button',
      icon: archived ? 'FolderArrowUp24Regular' : 'Archive24Regular',
      action: async () => {
        loadingArchiveAction = true;
        await data.actions.archiveDoc(!archived);
        setTimeout(() => {
          loadingArchiveAction = false;
        }, 1000);
      },
      loading: loadingArchiveAction,
      disabled:
        loadingArchiveAction ||
        isOldVersion ||
        $docData.data?.actionAccess?.archive !== true ||
        locked ||
        hidden ||
        loading ||
        disconnected,
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      type: 'button',
      icon: 'DocumentCopy24Regular',
      action: async () => {
        loadingCloneAction = true;
        await data.actions.cloneDoc();
        setTimeout(() => {
          loadingCloneAction = false;
        }, 1000);
      },
      loading: loadingCloneAction,
      disabled:
        loadingCloneAction ||
        $docData.data?.actionAccess?.modify !== true ||
        archived ||
        locked ||
        hidden ||
        loading ||
        disconnected,
    },
    docHasUnrestrictedAccess
      ? null
      : {
          id: 'share',
          label: 'Share',
          type: 'button',
          icon: 'Share24Regular',
          action: () => {
            shareDialogOpen = !shareDialogOpen;
          },
          disabled: shareDialogDisabled,
          tooltip:
            $docData.data?.actionAccess?.modify !== true
              ? `You cannot share this document because you do not have permission to modify it.`
              : undefined,
          hint: 'Ctrl + D',
        },
    hasPublishedDoc && currentStage === publishStage
      ? {
          id: 'updateSession',
          label: 'Begin update session',
          type: 'button',
          icon: 'DocumentEdit24Regular',
          action: async () => {
            loadingUpdateSessionAction = true;
            await data.actions.setDraftStage();
            setTimeout(() => {
              loadingUpdateSessionAction = false;
            }, 1000);
          },
          loading: loadingUpdateSessionAction,
          disabled:
            loadingUpdateSessionAction ||
            isOldVersion ||
            $docData.data?.actionAccess?.modify !== true ||
            archived ||
            locked ||
            hidden ||
            loading ||
            disconnected,
        }
      : null,
  ].filter(notEmpty);

  const advancedSharedData = derived([fullSharedData], ([$fullSharedData]) => {
    return merge($docData?.data?.doc || {}, $fullSharedData) as Record<string, unknown>;
  });

  $: coreSidebarProps = {
    docInfo: {
      _id: `${$docData.data?.doc?.[data.collection.config.by?.one || '_id']}`,
      createdAt: getProperty($sharedData, 'timestamps.created_at'),
      modifiedAt: getProperty($sharedData, 'timestamps.modified_at'),
      collectionName: data.collection.schemaName,
    },
    disabled,
    ydoc,
    stageDef,
    sharedData,
    fullSharedData: advancedSharedData,
    awareness,
    tenant: data.params.tenant,
    preview: {
      previewUrl: data.collection.config.options?.previewUrl || undefined,
      refreshDocData: $docData.refetch,
    },
    permissions: {
      users:
        getProperty($fullSharedData, 'permissions.users')?.map(
          (user: { value: any; name: any; label: any }) => ({
            ...user,
            _id: user.value,
            name: user.name || user.label || 'User',
            color: data.helpers.colorHash.hex(user.value || '0'),
          })
        ) || [],
      teams:
        getProperty($fullSharedData, 'permissions.teams')
          ?.filter(notEmpty)
          .map((value: { value: any; label: any }) => {
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
    actions,
  };

  $: collapsedFields = data.helpers.processSchemaDef({ collapsed: true, showHidden: showHiddenFields });

  function keyboardShortcuts(evt: KeyboardEvent) {
    // trigger whether hidden fields are shown
    // ALT + SHIFT + H
    if (evt.altKey && evt.shiftKey && evt.key === 'H') {
      evt.preventDefault();
      showHiddenFields = !showHiddenFields;
      return;
    }

    // show the share doc dialog
    // CTRL + D
    if (evt.ctrlKey && evt.key === 'd') {
      evt.preventDefault();
      if (!shareDialogDisabled) shareDialogOpen = true;
      return;
    }

    // toggle watch doc
    // CTRL + SHIFT + F
    if (evt.ctrlKey && evt.shiftKey && evt.key === 'F') {
      evt.preventDefault();
      const watchAction = actions.find((action) => action.id === 'watch');
      if (watchAction && !watchAction.disabled) watchAction.action(evt);
      return;
    }

    // show the save doc dialog
    // CTRL + S
    if (evt.ctrlKey && evt.key === 's') {
      evt.preventDefault();
      saveDocDialogOpen = true;
      return;
    }

    // show the publish doc dialog
    // CTRL + SHIFT + P
    if (evt.ctrlKey && evt.shiftKey && evt.key === 'P') {
      evt.preventDefault();
      if (!publishDialogDisabled) publishDialogOpen = true;
      return;
    }
  }
  onMount(() => {
    document.addEventListener('keydown', keyboardShortcuts);
  });
  onDestroy(() => {
    document.removeEventListener('keydown', keyboardShortcuts);
  });

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
                disabled={!$docData || !hasLoadedAtLeastOnce}
              >
                Compose
              </Button>
              <Button
                data-tab={'preview'}
                on:click={handleTabClick}
                on:mouseenter={handleTabMouseEnter}
                on:mouseleave={handleTabMouseLeave}
                disabled={!$docData || !hasLoadedAtLeastOnce}
              >
                Preview
              </Button>
              <div class="tabline" style="width: {activeTabWidth}px; left: {activeTabLeft}px;" />
            </div>
          </div>

          {#if !$docData}
            <div
              in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
              class="message-box"
            >
              <FluentIcon
                name="ErrorCircle24Regular"
                style="width: 32px; height: 32px; fill: var(--fds-accent-default);"
              />
              <TextBlock variant="bodyStrong">
                This document does not exist <i>or</i> you do not have access.
              </TextBlock>
              <TextBlock style="margin-top: -14px;">
                If you know this document exists, ask someone with access to grant you access.
              </TextBlock>
            </div>
          {:else if !hasLoadedAtLeastOnce}
            <div
              in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
              class="message-box"
            >
              <ProgressRing size={32} />
              <TextBlock variant="bodyStrong">Connecting to collaboration server</TextBlock>
            </div>
          {:else}
            <div class="alerts-wrapper" class:tabsShown={true}>
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
                {@const action = actions.find((action) => action.id === 'archive')}
                <InfoBar
                  title="This document is opened in read-only mode because it is archived."
                  severity="attention"
                  closable={false}
                >
                  {#if action}
                    {@const { label, icon, loading, action: onclick, disabled } = action}
                    <Button slot="action" disabled={disabled || loading} on:click={disabled ? null : onclick}>
                      {#if loading}
                        <div class="button-progress"><ProgressRing size={16} /></div>
                      {/if}
                      <FluentIcon
                        name={icon}
                        mode="buttonIconLeft"
                        style={loading ? 'visibility: hidden;' : ''}
                      />
                      <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">
                        {label}
                      </span>
                    </Button>
                  {/if}
                </InfoBar>
              {/if}
              {#if !!$sharedData.hidden && !isOldVersion}
                {@const action = actions.find((action) => action.id === 'delete')}
                <InfoBar
                  title="This document is opened in read-only mode because it is deleted."
                  severity="attention"
                  closable={false}
                >
                  {#if action}
                    {@const { label, icon, loading, action: onclick, disabled } = action}
                    <Button slot="action" disabled={disabled || loading} on:click={disabled ? null : onclick}>
                      {#if loading}
                        <div class="button-progress"><ProgressRing size={16} /></div>
                      {/if}
                      <FluentIcon
                        name={icon}
                        mode="buttonIconLeft"
                        style={loading ? 'visibility: hidden;' : ''}
                      />
                      <span style="white-space: nowrap; {loading ? 'visibility: hidden;' : ''}">
                        {label}
                      </span>
                    </Button>
                  {/if}
                </InfoBar>
              {/if}
              {#if !!$sharedData._hasPublishedDoc}
                {#if $sharedData.stage === publishStage}
                  {@const action = actions.find((action) => action.id === 'updateSession')}
                  <InfoBar
                    title="This document is read-only mode because it is published."
                    severity="attention"
                    closable={false}
                  >
                    Begin an update session to make edits.
                    {#if action}
                      {@const { label, icon, loading, action: onclick, disabled } = action}
                      <Button slot="action" disabled={disabled || loading} on:click={disabled ? null : onclick}>
                        {#if loading}
                          <div class="button-progress"><ProgressRing size={16} /></div>
                        {/if}
                        <FluentIcon
                          name={icon}
                          mode="buttonIconLeft"
                          style={loading ? 'visibility: hidden;' : ''}
                        />
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
                src={data.collection.config.options.dynamicPreviewHref || undefined}
                fullSharedData={advancedSharedData}
                noOuterMargin
              />
            {/if}

            <!-- TODO: move this logic to a special SchemaDefField component that determines the correct -->
            <!-- field based on thnpme schema definition -->
            <!-- The component should have three modes: editor, publish, and create (to support all three cases) -->
            {#each data.helpers.processSchemaDef( { collapsed: false, showHidden: showHiddenFields } ) as [key, def]}
              <SchemaField
                {key}
                {def}
                {ydoc}
                disabled={disabled || activeTab === 'preview'}
                {wsProvider}
                user={data.yuser}
                processSchemaDef={(opts) => {
                  return data.helpers.processSchemaDef({ showHidden: showHiddenFields, ...opts });
                }}
                {coreSidebarProps}
                {fullSharedData}
                dynamicPreviewHref={data.collection.config.options?.dynamicPreviewHref || undefined}
                style={activeTab === 'preview' ? 'display: none;' : ''}
                collectionName={data.collection.schemaName}
                {actions}
                {connected}
              />
            {/each}

            {#if showCollapsedFields}
              {#each collapsedFields as [key, def]}
                <SchemaField
                  {key}
                  {def}
                  {ydoc}
                  disabled={disabled || activeTab === 'preview'}
                  {wsProvider}
                  user={data.yuser}
                  processSchemaDef={(opts) => {
                    return data.helpers.processSchemaDef({ showHidden: showHiddenFields, ...opts });
                  }}
                  {coreSidebarProps}
                  {fullSharedData}
                  dynamicPreviewHref={data.collection.config.options?.dynamicPreviewHref || undefined}
                  style={activeTab === 'preview' ? 'display: none;' : ''}
                  collectionName={data.collection.schemaName}
                  {actions}
                  {connected}
                />
              {/each}
            {:else if collapsedFields.length > 0 && activeTab === 'compose'}
              <FieldWrapper label="Advanced" forId="">
                <Button
                  style="height: 40px; width: 100%; justify-content: flex-start;"
                  on:click={() => (showCollapsedFields = !showCollapsedFields)}
                >
                  <FluentIcon name="ChevronDown24Regular" mode="buttonIconLeft" />
                  Show all fields
                </Button>
              </FieldWrapper>
            {/if}
          {/if}
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
    fullSharedData={coreSidebarProps.fullSharedData}
    awareness={coreSidebarProps.awareness}
    tenant={coreSidebarProps.tenant}
    preview={coreSidebarProps.preview}
    permissions={coreSidebarProps.permissions}
    hideVersions={coreSidebarProps.hideVersions}
    actions={coreSidebarProps.actions}
  />
</div>

<PublishDocDialog
  bind:open={publishDialogOpen}
  {tenant}
  {ydoc}
  {wsProvider}
  {disabled}
  user={data.yuser}
  processSchemaDef={data.helpers.processSchemaDef}
  {fullSharedData}
  fieldStyle=""
  collectionName={data.collection.schemaName}
  id={{ itemId: item_id, idKey: data.collection.config.by?.one || '_id' }}
/>

<ShareDocDialog
  bind:open={shareDialogOpen}
  {ydoc}
  {wsProvider}
  {disabled}
  user={data.yuser}
  {fullSharedData}
  fieldStyle=""
/>

<SaveDocumentDialog bind:open={saveDocDialogOpen} />

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

  .tabs :global(.button.style-standard),
  .tabs :global(.button.style-standard.disabled) {
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

  .button-progress {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .message-box {
    width: 100%;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin-top: 20px;
  }
</style>
