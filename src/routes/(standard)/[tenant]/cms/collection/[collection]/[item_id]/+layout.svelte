<script lang="ts">
  import { SchemaField } from '$lib/common/Field/index.js';
  import { CollectionItemPage } from '$react/CMS/CollectionItemPage';
  import { YProvider } from '$utils/YProvider.js';
  import { createYStore } from '$utils/createYStore.js';
  import { getProperty } from '$utils/objectPath.js';
  import type { HocuspocusProvider } from '@hocuspocus/provider';
  import { deconstructSchema, isTypeTuple } from '@jackbuehner/cristata-generator-schema';
  import { copy } from 'copy-anything';
  import { onDestroy, onMount } from 'svelte';
  import type { WebrtcProvider } from 'y-webrtc';
  import * as Y from 'yjs';

  export let data;
  const { collection, item_id, tenant, version_date } = data.params;

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
</script>

{$synced}

{JSON.stringify($connected, null, 2)}

<!-- TODO: move this logic to a special SchemaDefField component that determines the correct -->
<!-- field based on the schema definition -->
<!-- The component should have three modes: editor, publish, and create (to support all three cases) -->
{#each data.helpers.processSchemaDef() as [key, def]}
  <SchemaField {key} {def} {ydoc} />
{/each}

<react:CollectionItemPage {collection} {item_id} {tenant} {version_date} />
