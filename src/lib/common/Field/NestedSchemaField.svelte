<script lang="ts">
  import {
    deconstructSchema,
    type DeconstructedSchemaDefType,
    type NestedSchemaDefType,
  } from '@jackbuehner/cristata-generator-schema';
  import type { ComponentProps } from 'svelte';
  import { SchemaField } from '.';

  export let schemaFieldParams: ComponentProps<SchemaField>;
  $: ({
    key,
    def,
    mode,
    ydoc,
    wsProvider,
    disabled,
    user,
    processSchemaDef,
    coreSidebarProps,
    fullSharedData,
    dynamicPreviewHref,
    style,
    collectionName,
    actions,
  } = schemaFieldParams);
  export let ydocKey: string;
  export let nestedSchemaDef: NestedSchemaDefType;

  let processed: DeconstructedSchemaDefType = [];
  let nestedSchemaDefCache = '';
  $: if (JSON.stringify(nestedSchemaDef) !== nestedSchemaDefCache) {
    processed = processSchemaDef?.({ schemaDef: deconstructSchema(nestedSchemaDef, ydocKey) }) || [];
    nestedSchemaDefCache = JSON.stringify(nestedSchemaDef);
  }

  $: console.log(processed);
</script>

{#each processed as [key, def]}
  <SchemaField
    {key}
    {def}
    {mode}
    {ydoc}
    {wsProvider}
    {disabled}
    {user}
    {processSchemaDef}
    {coreSidebarProps}
    {fullSharedData}
    {dynamicPreviewHref}
    {style}
    {collectionName}
    {actions}
  />
{/each}
