<script lang="ts">
  import type { GlobalConfigQuery } from '$graphql/graphql';
  import { getQueryStore, type GraphqlQueryReturn } from '$graphql/query';
  import { SchemaField } from '$lib/common/Field';
  import { server } from '$utils/constants';
  import { createYStore } from '$utils/createYStore';
  import { deepen } from '$utils/deepen';
  import { isJSON } from '$utils/isJSON';
  import { processSchemaDef } from '$utils/processSchemaDef';
  import { gql } from '@apollo/client';
  import { deconstructSchema, type SchemaDefType } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty, uncapitalize } from '@jackbuehner/cristata-utils';
  import { Button, ContentDialog, InfoBar, ProgressRing } from 'fluent-svelte';
  import { print } from 'graphql';
  import { jsonToGraphQLQuery } from 'json-to-graphql-query';
  import { merge } from 'merge-anything';
  import { v4 as uuidv4 } from 'uuid';

  export let open = false;
  export let tenant: string;
  export let schemaName: string;
  export let title = 'Create new';

  const globalConfig = getQueryStore<GlobalConfigQuery>({ queryName: 'GlobalConfig', tenant });
  $: collections = $globalConfig.data?.configuration?.collections;
  $: collection = collections?.filter(notEmpty).find((col) => col.name === schemaName);
  $: deconstructedSchema = (() => {
    const schemaDefJson = collection?.schemaDef;
    if (!schemaDefJson || !isJSON(schemaDefJson)) return [];
    const schemaDef: SchemaDefType = JSON.parse(schemaDefJson);
    return deconstructSchema(schemaDef);
  })();
  $: requiredFields = deconstructedSchema.filter(
    ([key, def]) => def.required && def.default === undefined && !key.includes('.')
  );
  $: requiredFieldKeys = requiredFields.map(([key]) => key);

  const yuser = { _id: '', color: '', name: '', photo: '', sessionId: '' };
  $: ystore = createYStore({
    collection: schemaName,
    id: uuidv4(),
    tenant,
    deconstructedSchema,
    user: yuser,
    providerOpts: { noWebsocketConn: true },
  });
  $: ({ ydoc, wsProvider, fullSharedData, sharedData } = ystore);
  $: requiredSharedData = Object.fromEntries(
    Object.entries($sharedData).filter(([key]) => requiredFieldKeys.includes(key))
  );
  $: valuesAreSet =
    Object.keys(requiredSharedData).length === requiredFieldKeys.length &&
    Object.values(requiredSharedData).every((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return `${value}`.length > 0;
    });

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((_id: string | true) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function createDoc(): Promise<boolean | string> {
    const CREATE_ITEM = gql(
      jsonToGraphQLQuery({
        mutation: {
          response: {
            __aliasFor: `${uncapitalize(schemaName)}Create`,
            __args: merge(
              {},
              ...Object.entries(requiredSharedData).map(([key, value]) => {
                if (value === undefined) return {};
                if (typeof value === 'string') return deepen({ [key]: value });
                if (typeof value === 'number') return deepen({ [key]: value });
                if (typeof value === 'boolean') return deepen({ [key]: value });
                if (Array.isArray(value)) return deepen({ [key]: value });
                return {};
              })
            ),
            [collection?.by?.one || '_id']: true,
          },
        },
      })
    );

    return await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CREATE_ITEM),
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const json = (await res.json()) as GraphqlQueryReturn<{ response?: { [key: string]: string } }>;
          if (json?.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          } else {
            return json?.data?.response?.[collection?.by?.one || '_id'] || true;
          }
        }
        error = `${res.status} ${res.statusText}`;
        return false;
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });
  }
</script>

<ContentDialog {title} bind:open size="standard">
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to save changes">{error}</InfoBar>
    </div>
  {/if}

  {#each processSchemaDef({ schemaDef: requiredFields }) as [key, def]}
    <SchemaField {key} {def} {ydoc} {wsProvider} {fullSharedData} user={yuser} collectionName={schemaName} />
  {/each}

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!valuesAreSet}
      on:click={async () => {
        loadingSubmit = true;
        const success = await createDoc();
        if (success) {
          await handleAction?.();
          await handleSumbit?.(success);
          open = false;
        }
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Create
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
        open = false;
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
