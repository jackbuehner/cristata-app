<script lang="ts">
  import { ReferenceOne } from '$components/ContentField';
  import { RemoveUserFromTeam, type FieldDescriptionsQuery } from '$graphql/graphql';
  import { FieldWrapper, SchemaField } from '$lib/common/Field';
  import { SelectOne, type Option } from '$lib/common/Select';
  import { server } from '$utils/constants';
  import type { AwarenessUser, YStore } from '$utils/createYStore';
  import { notEmpty } from '$utils/notEmpty';
  import { getProperty } from '$utils/objectPath';
  import { gql } from '@apollo/client';
  import { uncapitalize } from '@jackbuehner/cristata-utils';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';
  import type { LayoutDataType } from '../../routes/(standard)/[tenant]/+layout';
  import type { ProcessSchemaDef } from '../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/+layout';
  import InviteUserDialog from './InviteUserDialog.svelte';

  export let open = false;

  export let tenant: string;
  export let ydoc: YStore['ydoc'];
  export let wsProvider: YStore['wsProvider'];
  export let disabled = false;
  export let user: AwarenessUser;
  export let processSchemaDef: ProcessSchemaDef;
  export let fullSharedData: YStore['fullSharedData'];
  export let fieldStyle = '';
  export let collectionName: string;
  export let id: { itemId: string; idKey: string };

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((publishedAt: string, updatedAt: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  $: publishedAt = (() => {
    const timestamp = getProperty($fullSharedData || {}, 'timestamps.published_at');
    if (!timestamp || isNaN(new Date(timestamp)?.getFullYear())) return '';
    return timestamp;
  })();
  $: updatedAt = (() => {
    const timestamp = getProperty($fullSharedData || {}, 'timestamps.updated_at');
    if (!timestamp || isNaN(new Date(timestamp)?.getFullYear())) return '';
    return timestamp;
  })();
  $: shortId = id.itemId.slice(-6);

  let confirm = '';

  async function publishDoc(publishedAt: string): Promise<boolean> {
    const PUBLISH_ITEM = gql`mutation {
      ${uncapitalize(collectionName)}Publish(${id.idKey || '_id'}: "${
      id.itemId
    }", published_at: "${publishedAt}", publish: true) {
        timestamps {
          published_at
        }
      }
    }`;

    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(PUBLISH_ITEM),
        variables: {
          _id: id.idKey,
          publishedAt: publishedAt,
          publish: true,
        },
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          } else {
            return true;
          }
        }
        error = `${res.status} ${res.statusText}`;
        return false;
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });

    return res;
  }

  async function handleSave(publishedAt: string) {
    loadingSubmit = true;
    const success = await publishDoc(publishedAt);
    if (success) {
      await handleAction?.();
      await handleSumbit?.(publishedAt, updatedAt);
      open = false;
      confirm = '';
    }
    loadingSubmit = false;
  }
</script>

<ContentDialog title="Publish document" trapFocus={false} bind:open size="max" style="inline-size: 600px;">
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to save changes">{error}</InfoBar>
    </div>
  {/if}

  <InfoBar severity="caution" title="Check your work before you publish" closable={false}>
    Once you publish this document, it will be available for everyone to see. Only a few people will be able to
    unpublish this document.
  </InfoBar>

  <br />

  <SchemaField
    key="timestamps.published_at"
    def={{
      type: 'Date',
      field: {
        label: 'Choose publish date and time',
        description:
          'This data can be any time in the past or future. Content will not appear until the date has occured.',
      },
      docs: undefined,
      modifiable: true,
    }}
    {ydoc}
    {disabled}
    {wsProvider}
    {user}
    {processSchemaDef}
    {fullSharedData}
    {collectionName}
    style={fieldStyle}
  />

  <SchemaField
    key="timestamps.updated_at"
    def={{
      type: 'Date',
      field: {
        label: 'Choose update date and time',
        description:
          'Indicate that this document has been updated since its publish date. Not required on initial publish.',
      },
      docs: undefined,
      modifiable: true,
    }}
    {ydoc}
    {disabled}
    {wsProvider}
    {user}
    {processSchemaDef}
    {fullSharedData}
    {collectionName}
    style={fieldStyle}
  />

  {#each processSchemaDef({ isPublishModal: true }) as [key, def]}
    <SchemaField
      {key}
      {def}
      {ydoc}
      {disabled}
      {wsProvider}
      {user}
      mode="publish"
      {processSchemaDef}
      {fullSharedData}
      {collectionName}
      style={fieldStyle}
    />
  {/each}

  <FieldWrapper
    label="Confirm publish"
    description="Publish document <code>{shortId}</code>"
    forId={'____confirmPublish'}
  >
    <TextBox {disabled} placeholder={`Type "${shortId}" to publish the document`} bind:value={confirm} />
  </FieldWrapper>

  <InfoBar severity="information" title="Don't make a mistake" closable={false}>
    Before continuing, check the document and its metadata for formatting issues and typos
  </InfoBar>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!publishedAt || confirm !== shortId}
      on:click={async () => {
        if (publishedAt) {
          await handleSave(publishedAt);
        }
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Publish
      {/if}
    </Button>
    <Button
      on:click={async () => {
        if (hasChanged) {
          loadingCancel = true;
          await handleAction?.();
          await handleCancel?.();
          loadingCancel = false;
        }
        open = false;
        confirm = '';
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>
