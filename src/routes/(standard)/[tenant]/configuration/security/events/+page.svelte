<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, ProgressRing, TextBlock } from 'fluent-svelte';
  import type { PageData } from './$types';
  import EventsListTable from './EventsListTable.svelte';

  export let data: PageData;
  $: ({ eventsList } = data);

  $: if (browser) document.title = 'Events log';
</script>

<div class="wrapper">
  <div class="header">
    <PageTitle fullWidth>Events</PageTitle>

    <ActionRow fullWidth>
      {#if true}
        <Button
          style="width: 130px;"
          on:click={() => {
            $eventsList.refetch({
              filter: JSON.stringify({ at: { $lt: new Date() } }),
            });
          }}
          disabled={$eventsList.loading}
        >
          {#if $eventsList.loading}
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
        All recorded document and webhook events can be viewed in this list. Document events occur when a
        document is created, modified, or deleted. Webhook events occur when a webhook is dispatched.
      </TextBlock>
    </div>
  </div>

  <div class="table-wrapper">
    <EventsListTable
      data={($eventsList.data?.cristataEvents?.docs || []).filter(notEmpty).map((event) => {
        return {
          _id: `${event._id}`,
          label: (() => {
            if (event.document) {
              const docDetails = JSON.parse(event.document);
              const collection = docDetails?.collection;
              const collectionMessage = collection ? `in the ${collection} collection` : '';

              if (event.name === 'modify') {
                return `A document was modified ${collectionMessage} via a ${event.reason} command`;
              }
              if (event.name === 'publish') {
                return `A document was published ${collectionMessage} via a ${event.reason} command`;
              }
              if (event.name === 'unpublish') {
                return `A document was unpublished ${collectionMessage} via a ${event.reason} command`;
              }
              if (event.name === 'delete') {
                return `A document was deleted ${collectionMessage} via a ${event.reason} command`;
              }
            }

            if (event.webhook) {
              const webhookDetails = JSON.parse(event.webhook);
              const webhookName = webhookDetails?.name;
              const success = webhookDetails?.result === '200';

              return `Webhook "${webhookName}" was dispatched and ${
                success ? 'successfully received' : 'failed'
              }`;
            }

            return event.webhook;
          })(),
          at: new Date(event.at),
        };
      })}
      loading={$eventsList.loading}
      totalDocs={$eventsList.data?.cristataEvents?.totalDocs ?? undefined}
      fetchMore={async () => {
        if ($eventsList.data?.cristataEvents?.docs) {
          await $eventsList
            .fetchMore($eventsList.data.cristataEvents.docs.length, 20)
            .then(({ current, next, setStore }) => {
              if (current && next) {
                const allDocs = [...(current.cristataEvents?.docs || []), ...(next.cristataEvents?.docs || [])];
                setStore({
                  ...current,
                  cristataEvents: { totalDocs: current.cristataEvents?.totalDocs || 0, docs: allDocs },
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
