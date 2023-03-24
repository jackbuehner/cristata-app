<script lang="ts">
  import { page } from '$app/stores';
  import {
    ActivitiesList,
    type ActivitiesListQuery,
    type ActivitiesListQueryVariables,
  } from '$graphql/graphql';
  import { query, type GraphqlQueryReturn } from '$graphql/query';
  import { Chip } from '$lib/common/Chip';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import { compactMode } from '$stores/compactMode';
  import { formatISODate } from '$utils/formatISODate';
  import { isStringArray } from '$utils/isStringArray';
  import { listOxford } from '$utils/listOxford';
  import { getProperty } from '$utils/objectPath';
  import { openWindow } from '$utils/openWindow';
  import { isTypeTuple, type SchemaDef as AppSchemaDef } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, TextBlock } from 'fluent-svelte';
  import type { PageData } from './$types';
  import { selectedIds } from './selectedIdsStore';

  interface SchemaDef extends AppSchemaDef {
    docs?: undefined;
  }

  export let totalDocs: number;
  export let collection: NonNullable<PageData['collection']>;
  export let schema: NonNullable<PageData['table']>['schema'];
  export let tableData: NonNullable<PageData['table']>['data'];
  export let photoTemplate = '';

  $: de = schema
    ?.sort((a, b) => {
      if ((a[1].column?.order || 1000) > (b[1].column?.order || 1000)) return 1;
      return -1;
    })
    .filter((x): x is [string, SchemaDef] => {
      const [key, def] = x;

      if (key === 'permissions.users') return false;
      if (key === 'permissions.teams') return false;
      if (key === 'people.created_by') return false;
      if (key === 'people.last_modified_by') return false;
      if (key === 'timestamps.modified_at') return false;
      if (key === 'timestamps.updated_at') return false;
      if (key === 'name') return false;

      // an array of documents can not be represented
      const isSubDocArray = def.type === 'DocArray';
      if (isSubDocArray) return false;

      // hide hidden columns
      if (def.column?.hidden === true) return false;

      return true;
    });

  // if the field is a body field that is rendered as a tiptap editor,
  // we want to open it in maximized mode for easy access to the editor
  const shouldOpenMaximized = !!schema.find(([key, def]) => key === 'body' && def.field?.tiptap);

  const oneAccessor = collection.config?.data?.configuration?.collection?.by?.one || '_id';

  const links = {
    href: `/${$page.params.tenant}/cms/collection/${$page.params.collection}`,
    hrefSuffixKey: oneAccessor,
    hrefSearch: shouldOpenMaximized ? '?fs=1&props=1' : undefined,
    windowName: `editor-${$page.params.tenant}-${collection.name}-`,
  };

  $: firstSelectedHref = `${links.href}/${
    ($tableData?.data?.data?.docs || []).find((doc: { _id: string }) => doc._id === $selectedIds[0])?.[
      links.hrefSuffixKey
    ]
  }${links.hrefSearch || ''}`;

  // get the doc and docId, if they exist
  $: doc = $tableData.data?.data?.docs?.filter(notEmpty).find((doc) => doc._id === $selectedIds[0]);
  $: docId = doc ? getProperty(doc, oneAccessor) : undefined;

  // fetch the latest activity for the selected doc
  let activitiesList: Promise<GraphqlQueryReturn<ActivitiesListQuery>> | undefined = undefined;
  $: fetchActivitiesList(docId);
  function fetchActivitiesList(docId: string) {
    activitiesList = query<ActivitiesListQuery, ActivitiesListQueryVariables>({
      fetch,
      tenant: $page.params.tenant,
      query: ActivitiesList,
      variables: {
        limit: 5,
        filter: JSON.stringify({
          colName: collection.schemaName,
          docId: docId,
        }),
      },
      useCache: true,
      expireCache: 30000, // 30 seconds
    });
  }

  function getHrefWithParam(name: string, value: string) {
    const url = new URL($page.url);
    url.searchParams.set(name, value);
    return url.toString();
  }
</script>

<aside class="wrapper">
  {#if $selectedIds.length === 1 && doc?.name}
    <TextBlock variant="subtitle" tah="h1">
      {doc.name}
    </TextBlock>
  {:else if $selectedIds.length > 0}
    <TextBlock variant="subtitle" tah="h1">
      {$selectedIds.length} selected
      {#if $selectedIds.length === 1}
        document
      {:else}
        documents
      {/if}
    </TextBlock>
  {:else}
    <TextBlock variant="subtitle" tah="h1">
      {totalDocs}
      {#if totalDocs === 1}
        document
      {:else}
        documents
      {/if}
    </TextBlock>
  {/if}

  {#if $selectedIds.length === 1}
    {#if doc}
      {@const categoriesDef = de.find(([key]) => key === 'categories')?.[1]}
      {@const categories = categoriesDef && isStringArray(doc.categories) ? doc.categories : []}

      {@const tagsDef = de.find(([key]) => key === 'tags')?.[1]}
      {@const tags = tagsDef && isStringArray(doc.tags) ? doc.tags : []}

      {@const photoHref = photoTemplate?.replace('{{_id}}', getProperty(doc, oneAccessor))}

      {#if photoHref}
        <a
          href={photoHref}
          on:click={(evt) => {
            evt.preventDefault();
            window.open(photoHref, photoHref, 'location=no');
          }}
        >
          <img
            src={photoHref}
            alt=""
            width="100%"
            style="object-fit: contain; object-position: left; aspect-ratio: 1.4 / 1; margin-top: 20px;"
          />
        </a>
      {/if}

      <section>
        <div class="button-row">
          <Button
            href={firstSelectedHref}
            disabled={$selectedIds.length !== 1}
            on:click={(evt) => {
              evt.preventDefault();
              openWindow(firstSelectedHref, links.windowName + $selectedIds[0], 'location=no');
            }}
          >
            <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
            Open in Editor
          </Button>
          {#if photoHref}
            <Button
              href={photoHref}
              on:click={(evt) => {
                evt.preventDefault();
                window.open(photoHref, photoHref, 'location=no');
              }}
            >
              <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
              Open photo
            </Button>
          {/if}
        </div>
      </section>

      <section>
        <TextBlock variant="bodyStrong" tag="h2">Permissions</TextBlock>
        <div style="margin: 0 0 2px 0;">
          <TextBlock variant="caption">This document is shared.</TextBlock>
        </div>
        <div style="margin: 2px 0 10px 0;">
          <TextBlock variant="caption">
            Open the document in Editor to manage access and add collaborators.
          </TextBlock>
        </div>
        <div class="button-row">
          <Button
            disabled={$selectedIds.length !== 1}
            on:click={() => {
              navigator.clipboard.writeText(`${$page.url.origin}${firstSelectedHref}`);
            }}
          >
            <FluentIcon name="Link20Regular" mode="buttonIconLeft" />
            Copy link
          </Button>
        </div>
      </section>

      {#if categories.length > 0}
        <section>
          <TextBlock variant="bodyStrong" tag="h2">Categories</TextBlock>
          <div class="chips-wrapper" class:compact={$compactMode}>
            {#if categoriesDef?.column?.chips}
              {#if typeof categoriesDef.column.chips === 'boolean'}
                {#each categories as cat}
                  <Chip color="neutral" data-value={cat} href={getHrefWithParam('categories', `["${cat}"]`)}>
                    {cat}
                  </Chip>
                {/each}
              {:else}
                {#each categories as cat}
                  {@const match = categoriesDef?.column.chips.find((s) => s.value === cat)}
                  <Chip color="neutral" data-value={cat} href={getHrefWithParam('categories', `["${cat}"]`)}>
                    {match?.label || cat}
                  </Chip>
                {/each}
              {/if}
            {/if}
          </div>
        </section>
      {/if}

      {#if tags.length > 0}
        <section>
          <TextBlock variant="bodyStrong" tag="h2">Tags</TextBlock>
          <div class="chips-wrapper" class:compact={$compactMode}>
            {#if tagsDef?.column?.chips}
              {#if typeof tagsDef.column.chips === 'boolean'}
                {#each tags as tag}
                  <Chip color="neutral" data-value={tag} href={getHrefWithParam('tags', `["${tag}"]`)}>
                    {tag}
                  </Chip>
                {/each}
              {:else}
                {#each tags as tag}
                  {@const match = tagsDef?.column.chips.find((s) => s.value === tag)}
                  <Chip color="neutral" data-value={tag} href={getHrefWithParam('tags', `["${tag}"]`)}>
                    {match?.label || tag}
                  </Chip>
                {/each}
              {/if}
            {/if}
          </div>
        </section>
      {/if}

      <section>
        <TextBlock variant="bodyStrong" tag="h2">Details</TextBlock>
        <div class="details-grid">
          {#each de.filter(([key]) => key !== 'tags' && key !== 'categories') as [key, def]}
            {@const value = getProperty(doc, key) ?? ''}
            {@const label = def.column?.label || (key === 'timestamps.published_at' ? 'Published at' : key)}
            {#if def.type === 'Date'}
              <TextBlock variant="caption">{label}</TextBlock>
              <TextBlock variant="caption">{formatISODate(value, false, true, true)}</TextBlock>
            {:else if def.column?.reference?.collection || isTypeTuple(def.type)}
              {@const refData = Array.isArray(value) ? value : [value]}
              {@const refDataWithStandardKeys = refData.map((data) => {
                return {
                  _id: getProperty(data, def.column?.reference?.fields?._id || '_id'),
                  name: getProperty(data, def.column?.reference?.fields?.name || 'name'),
                };
              })}
              <TextBlock variant="caption">{label}</TextBlock>
              <TextBlock variant="caption">
                {listOxford(refDataWithStandardKeys.map(({ name }) => name)) || ''}
              </TextBlock>
            {:else if typeof value === 'string'}
              <TextBlock variant="caption">{label}</TextBlock>
              <TextBlock variant="caption">{value}</TextBlock>
            {:else if typeof value === 'number'}
              <TextBlock variant="caption">{label}</TextBlock>
              <TextBlock variant="caption">{value}</TextBlock>
            {:else if typeof value === 'boolean'}
              <TextBlock variant="caption">{label}</TextBlock>
              <TextBlock variant="caption">{value ? 'Yes' : 'No'}</TextBlock>
            {:else}
              <TextBlock variant="caption">{label}</TextBlock>
              <TextBlock variant="caption">{value}</TextBlock>
            {/if}
          {/each}
          {#if doc.people?.created_by?.name}
            <TextBlock variant="caption">Created by</TextBlock>
            <TextBlock variant="caption">{doc.people?.created_by?.name}</TextBlock>
          {/if}
          {#if doc.people?.last_modified_by?.name}
            <TextBlock variant="caption">Last modified by</TextBlock>
            <TextBlock variant="caption">{doc.people.last_modified_by.name}</TextBlock>
          {/if}
          {#if doc.timestamps?.modified_at}
            <TextBlock variant="caption">Last modified at</TextBlock>
            <TextBlock variant="caption">
              {formatISODate(doc.timestamps.modified_at, false, true, true)}
            </TextBlock>
          {/if}
        </div>
      </section>

      {#if activitiesList}
        <section>
          <TextBlock variant="bodyStrong" tag="h2">Activity</TextBlock>
          <div>
            {#await activitiesList}
              <Loading message="Loading activity..." />
            {:then activitiesListData}
              {@const docs = (activitiesListData?.data?.activities?.docs || []).filter(notEmpty)}
              {#if docs.length > 0}
                {#each docs as doc}
                  <TextBlock variant="caption">
                    <FluentIcon name="Edit16Regular" mode="bodyStrongLeft" />
                    {listOxford(doc.userIds?.filter(notEmpty).map(({ name }) => name)) || 'Unknown'}
                    {#if doc.type === 'created'}
                      created
                    {:else if doc.type === 'ydoc-modified' || doc.type === 'modified'}
                      modified
                    {:else if doc.type === 'published'}
                      published
                    {:else if doc.type === 'unpublished'}
                      unpublished
                    {:else if doc.type === 'archive'}
                      archived
                    {:else if doc.type === 'unarchive'}
                      unarchived
                    {:else if doc.type === 'hidden'}
                      deleted
                    {:else if doc.type === 'unhidden'}
                      restored
                    {:else if doc.type === 'delete'}
                      permanently deleted
                    {:else}
                      {doc.type}
                    {/if}
                    this document
                  </TextBlock>
                {/each}
              {:else}
                <TextBlock variant="caption">No activity</TextBlock>
              {/if}
            {:catch error}
              {error.message}
            {/await}
          </div>
        </section>
      {/if}
    {/if}
  {/if}
</aside>

<style>
  aside.wrapper {
    border-left: 1px solid var(--border-color);
    width: 320px;
    height: 100%;
    overflow: hidden auto;
    padding: 20px;
    box-sizing: border-box;
  }

  div.button-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  section {
    margin: 20px 0 25px 0;
  }

  section :global(.text-block.type-body-strong:nth-child(1)) {
    margin-bottom: 10px;
  }

  div.details-grid {
    display: grid;
    grid-template-columns: 0.6fr 1fr;
    gap: 0 10px;
    grid-template-rows: auto;
  }

  div.details-grid > :global(*:nth-child(even)) {
    text-align: right;
  }

  .chips-wrapper {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin: 2px 0;
    flex-wrap: wrap;
  }

  .chips-wrapper.compact {
    gap: 3px;
  }
</style>
