<script lang="ts">
  import { browser } from '$app/environment';
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { motionMode } from '$stores/motionMode';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, ComboBox, ProgressRing, TextBox } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';
  import TriggersList from './TriggersList.svelte';

  export let data: PageData;
  $: ({ webhook, saveWebhookChanges } = data);
  $: webhookData = $webhook.data?.cristataWebhook ?? undefined;

  $: if (browser) document.title = webhookData?.name ? `Webhook: ${webhookData.name}` : 'Webhook';

  let saving = false;
</script>

<PageTitle>
  {#if webhookData?.name}
    Webhook: {webhookData.name}
  {:else}
    Webhook
  {/if}
</PageTitle>

<ActionRow>
  <Button
    variant="accent"
    disabled={!webhookData || !navigator.clipboard || saving}
    on:click={() => {
      if (navigator.clipboard && webhookData) navigator.clipboard.writeText(webhookData._id);
    }}
  >
    <FluentIcon name="Copy16Regular" mode="buttonIconLeft" />
    Copy webhook ID
  </Button>
  <Button
    disabled={!webhookData || saving}
    style="width: 142px;"
    on:click={async () => {
      saving = true;
      if (webhookData) {
        await saveWebhookChanges(webhookData._id, {
          name: webhookData.name,
          url: webhookData.url,
          verb: webhookData.verb,
          triggers: webhookData.triggers,
          collections: webhookData.collections,
        });
      }
      saving = false;
      await $webhook.refetch();
    }}
  >
    {#if saving}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
      Save changes
    {/if}
  </Button>
  <Button
    style="width: 100px;"
    on:click={() => {
      $webhook.refetch();
    }}
    disabled={$webhook.loading}
  >
    {#if $webhook.loading}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
      Refresh
    {/if}
  </Button>
</ActionRow>

{#if webhookData}
  <section in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
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
  </section>
{/if}

<style>
  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;

    display: flex;
    flex-direction: row-reverse;
    gap: 50px;
  }

  section > div:first-of-type {
    flex: 1;
  }

  .triggers-checkboxes-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 5px 0;
  }
</style>
