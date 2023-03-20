<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { motionMode } from '$stores/motionMode';
  import { isJSON, notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, ComboBox, InfoBar, ProgressRing, TextBox } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import TriggersList from '../[webhook_id]/TriggersList.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const webhookData = {
    name: '',
    url: '',
    verb: 'POST',
    collections: [] as string[],
    triggers: [] as string[],
  };

  $: if (browser) document.title = 'Create webhook';

  let saving = false;
  let error = '';
</script>

<PageTitle>Create webhook</PageTitle>

<ActionRow>
  <Button
    variant="accent"
    disabled={!webhookData || saving || !webhookData.name || !webhookData.url}
    style="width: 94px;"
    on:click={async () => {
      saving = true;
      if (webhookData) {
        await data
          .createWebhook({
            name: webhookData.name,
            url: webhookData.url,
            verb: webhookData.verb,
            triggers: webhookData.triggers,
            collections: webhookData.collections,
          })
          .finally(() => {
            saving = false;
          })
          .then((_data) => {
            if (!_data.cristataWebhookCreate) {
              throw new Error(`The response data is missing.`);
            }
            goto(`/${data.authUser.tenant}/configuration/security/webhooks/${_data.cristataWebhookCreate._id}`);
          })
          .catch((err) => {
            // graphql error
            if (isJSON(err.message) && Array.isArray(JSON.parse(err.message))) {
              error = JSON.parse(err.message)[0]?.message;
              return;
            }

            if (err.message) {
              error = err.message;
              return;
            }

            error = JSON.stringify(err);
          });
      }
    }}
  >
    {#if saving}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="Add16Regular" mode="buttonIconLeft" />
      Create
    {/if}
  </Button>
</ActionRow>

<section in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
  {#if error}
    <InfoBar severity="critical">
      Error creating webhook:
      <pre style="white-space: normal;">{error}</pre>
    </InfoBar>
  {/if}

  <div class="flex-zone">
    <div>
      <FieldWrapper label="Name" forId="webhook-name">
        <TextBox type="text" id="webhook-name" bind:value={webhookData.name} />
      </FieldWrapper>

      <FieldWrapper label="URL" forId="webhook-url">
        <div style="display: flex; gap: 10px;">
          <ComboBox
            id="webhook-verb"
            items={[
              { name: 'GET', value: 'GET' },
              { name: 'POST', value: 'POST' },
            ]}
            bind:value={webhookData.verb}
            style="width: 100px;"
          />
          <TextBox type="text" id="webhook-url" bind:value={webhookData.url} />
        </div>
      </FieldWrapper>

      <FieldWrapper label="Collection" forId="webhook-collections">
        <ComboBox
          id="webhook-collections"
          placeholder="Select a collection"
          items={data.configuration?.collections
            ?.filter(notEmpty)
            .filter((col) => {
              return col.name !== 'Activity' && col.name !== 'User' && col.name.indexOf('Cristata') !== 0;
            })
            .map((col) => {
              return { value: col.name, name: col.name };
            })}
          bind:value={webhookData.collections[0]}
        />
      </FieldWrapper>
    </div>
    <div>
      <FieldWrapper label="Triggers" forId="webhook-triggers">
        <div class="triggers-checkboxes-wrapper">
          <TriggersList bind:triggers={webhookData.triggers} />
        </div>
      </FieldWrapper>
    </div>
  </div>
</section>

<style>
  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  div.flex-zone {
    display: flex;
    flex-direction: row-reverse;
    gap: 50px;
    margin-top: 20px;
  }

  div.flex-zone > div:first-of-type {
    flex: 1;
  }

  .triggers-checkboxes-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 5px 0;
  }
</style>
