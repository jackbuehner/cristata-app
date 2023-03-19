<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, ProgressRing, TextBlock } from 'fluent-svelte';
  import type { PageData } from './$types';
  import WebhooksTable from './WebhooksTable.svelte';

  export let data: PageData;
  $: ({ webhooksList } = data);

  $: if (browser) document.title = 'Webhooks';
</script>

<div class="wrapper">
  <div class="header">
    <PageTitle fullWidth>Webhooks</PageTitle>

    <ActionRow fullWidth>
      {#if true}
        <Button
          style="width: 130px;"
          on:click={() => {
            $webhooksList.refetch();
          }}
          disabled={$webhooksList.loading}
        >
          {#if $webhooksList.loading}
            <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
          {:else}
            <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
            Refresh list
          {/if}
        </Button>
      {/if}
    </ActionRow>

    <div style="padding: 0 20px;">
      <TextBlock>
        Webhooks allow you to send data to your server or application in response to an event on Cristata.
      </TextBlock>
    </div>
  </div>

  <div class="table-wrapper">
    <WebhooksTable
      data={($webhooksList.data?.cristataWebhooks?.docs || []).filter(notEmpty).map((webhook) => {
        return {
          _id: `${webhook._id}`,
          label: webhook.name,
          triggers: webhook.triggers,
        };
      })}
      loading={$webhooksList.loading}
      totalDocs={$webhooksList.data?.cristataWebhooks?.totalDocs ?? undefined}
      fetchMore={async () => {
        if ($webhooksList.data?.cristataWebhooks?.docs) {
          await $webhooksList
            .fetchMore($webhooksList.data.cristataWebhooks.docs.length, 20)
            .then(({ current, next, setStore }) => {
              if (current && next) {
                const allDocs = [
                  ...(current.cristataWebhooks?.docs || []),
                  ...(next.cristataWebhooks?.docs || []),
                ];
                setStore({
                  ...current,
                  cristataWebhooks: { totalDocs: current.cristataWebhooks?.totalDocs || 0, docs: allDocs },
                });
              }
            });
        }
      }}
    />
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .table-wrapper {
    padding: 20px;
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
</style>
