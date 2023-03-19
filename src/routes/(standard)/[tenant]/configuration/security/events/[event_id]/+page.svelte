<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import { motionMode } from '$stores/motionMode';
  import { themeMode } from '$stores/themeMode';
  import { formatISODate } from '$utils/formatISODate';
  import Monaco from '@uwu/monaco-svelte';
  import type { IStandaloneCodeEditor } from '@uwu/monaco-svelte/src/types';
  import { Button, ProgressRing, TextBlock } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ event } = data);
  $: eventData = $event.data?.cristataEvent ?? undefined;
  $: webhookData = eventData?.webhook ? JSON.parse(eventData.webhook) : undefined;
  $: documentData = eventData?.document ? JSON.parse(eventData.document) : undefined;

  let eventDataEditor: IStandaloneCodeEditor;
  let eventDataEditorHeight = 100;
  $: eventDataEditor?.onDidContentSizeChange(() => {
    eventDataEditorHeight = eventDataEditor.getContentHeight();
  });
  const eventDataEditorValue = writable('');
  $: if (eventData) {
    $eventDataEditorValue = JSON.stringify({ ...eventData, webhook: undefined, document: undefined }, null, 2);
  }

  let documentDataEditor: IStandaloneCodeEditor;
  let documentDataEditorHeight = 100;
  $: documentDataEditor?.onDidContentSizeChange(() => {
    documentDataEditorHeight = documentDataEditor.getContentHeight();
  });
  const documentDataEditorValue = writable('');
  $: if (documentData) $documentDataEditorValue = JSON.stringify(documentData, null, 2);

  let webhookDataEditor: IStandaloneCodeEditor;
  let webhookDataEditorHeight = 100;
  $: webhookDataEditor?.onDidContentSizeChange(() => {
    webhookDataEditorHeight = webhookDataEditor.getContentHeight();
  });
  const webhookDataEditorValue = writable('');
  $: if (webhookData) $webhookDataEditorValue = JSON.stringify(webhookData, null, 2);

  $: if (browser) document.title = eventData?.name ? `Event viewer: ${eventData.name}` : 'Event viewer';
</script>

<PageTitle>
  {#if eventData?.name}
    Event: {eventData.name}
  {:else}
    Event
  {/if}
</PageTitle>

<ActionRow>
  <Button
    variant="accent"
    disabled={!eventData || !navigator.clipboard}
    on:click={() => {
      if (navigator.clipboard && eventData) navigator.clipboard.writeText(eventData._id);
    }}
  >
    <FluentIcon name="Copy16Regular" mode="buttonIconLeft" />
    Copy event ID
  </Button>
  <Button
    style="width: 100px;"
    on:click={() => {
      $event.refetch();
    }}
    disabled={$event.loading}
  >
    {#if $event.loading}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
      Refresh
    {/if}
  </Button>
</ActionRow>

{#if eventData}
  <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
    <PageSubtitle>Overview</PageSubtitle>

    <section class="overview">
      <div>
        <div style="opacity: 0.8;">
          <TextBlock variant="caption" tag="h3">Date</TextBlock>
        </div>
        <TextBlock>{formatISODate(eventData?.at, true, true, true)}</TextBlock>
      </div>
      <div>
        <div style="opacity: 0.8;">
          <TextBlock variant="caption" tag="h3">Source</TextBlock>
        </div>
        <TextBlock>{eventData?.reason}</TextBlock>
      </div>
    </section>
  </div>
{/if}

{#if $eventDataEditorValue}
  <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
    <PageSubtitle>Event data</PageSubtitle>

    <section class="data">
      <Monaco
        bind:ed={eventDataEditor}
        value={eventDataEditorValue}
        lang="json"
        theme={$themeMode === 'dark' ? 'vs-dark' : 'vs-light'}
        readonly
        height="{eventDataEditorHeight}px"
        width="100%"
        otherCfg={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wrappingStrategy: 'advanced',
          minimap: {
            enabled: false,
          },
          overviewRulerLanes: 0,
          contextmenu: false,
        }}
      />
    </section>
  </div>
{/if}

{#if $documentDataEditorValue}
  <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
    <PageSubtitle>Document data</PageSubtitle>

    <section class="data">
      <Monaco
        bind:ed={documentDataEditor}
        value={documentDataEditorValue}
        lang="json"
        readonly
        height="{documentDataEditorHeight}px"
        width="100%"
        otherCfg={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wrappingStrategy: 'advanced',
          minimap: {
            enabled: false,
          },
          overviewRulerLanes: 0,
          contextmenu: false,
        }}
      />
    </section>
  </div>
{/if}

{#if $webhookDataEditorValue}
  <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
    <PageSubtitle>Webhook data</PageSubtitle>

    <section class="data">
      <Monaco
        bind:ed={webhookDataEditor}
        value={webhookDataEditorValue}
        lang="json"
        readonly
        height="{webhookDataEditorHeight}px"
        width="100%"
        otherCfg={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wrappingStrategy: 'advanced',
          minimap: {
            enabled: false,
          },
          overviewRulerLanes: 0,
          contextmenu: false,
        }}
      />
    </section>
  </div>
{/if}

<style>
  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }
  section.overview {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  section :global(.monaco-editor),
  section :global(.monaco-editor-background),
  section :global(.monaco-editor .margin) {
    background-color: transparent;
  }

  section :global(.monaco-quick-open-widget) {
    display: none;
  }
</style>
