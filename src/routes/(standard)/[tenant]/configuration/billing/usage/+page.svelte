<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import PageSubtitle from '$lib/common/PageTitle/PageSubtitle.svelte';
  import { formatISODate } from '$utils/formatISODate.js';
  import { Button, ProgressRing, TextBlock } from 'fluent-svelte';

  export let data;
  $: ({ serviceUsage } = data);

  $: if (browser) document.title = 'Service usage';
</script>

<PageTitle>Service usage</PageTitle>

<ActionRow>
  <Button
    style="width: 140px;"
    on:click={() => {
      $serviceUsage.refetch();
    }}
    disabled={$serviceUsage.loading}
  >
    {#if $serviceUsage.loading}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
      Refresh usage
    {/if}
  </Button>
</ActionRow>

<PageSubtitle style="margin-bottom: 0px;">API usage</PageSubtitle>

<section>
  <TextBlock>
    Every time a website or app requests data from the Cristata API, we record that the request occured. Each
    query requires effort from our servers, so we add a small fee for each query made outside of Cristata apps
    (e.g. your website) so that we can keep the servers running.
  </TextBlock>
  {#if $serviceUsage.data?.billing.usage.api}
    <TextBlock tag="span" style="margin-top: 4px;">
      <i>Since {formatISODate($serviceUsage.data.billing.usage.api?.since, false, true, true)}</i>
    </TextBlock>
  {/if}

  <TextBlock tag="h3" variant="bodyStrong" class="subsubhead">Billable queries</TextBlock>
  <TextBlock tag="span" variant="bodyLarge">
    {$serviceUsage.data?.billing.usage.api?.billable ?? '-'}
  </TextBlock>

  <TextBlock tag="h3" variant="bodyStrong" class="subsubhead">Total queries</TextBlock>
  <TextBlock tag="span" variant="bodyLarge">
    {$serviceUsage.data?.billing.usage.api?.total ?? '-'}
  </TextBlock>
</section>

<PageSubtitle style="margin-bottom: 0px;">Storage</PageSubtitle>

<section>
  <TextBlock>
    Your content takes up a lot of space! To keep costs fair, we only charge you for the space that you use -
    not the space that you might use. Keeps tabs on how much space you are consuming here.
  </TextBlock>

  <TextBlock tag="h3" variant="bodyStrong" class="subsubhead">Database storage</TextBlock>
  <TextBlock tag="span" variant="bodyLarge">
    {(($serviceUsage.data?.billing.usage.storage.database || 0) / 1000000000).toFixed(2)} GB
  </TextBlock>

  <TextBlock tag="h3" variant="bodyStrong" class="subsubhead">File storage</TextBlock>
  <TextBlock tag="span" variant="bodyLarge">
    {(($serviceUsage.data?.billing.usage.storage.files || 0) / 1000000000).toFixed(2)} GB
  </TextBlock>
</section>

<style>
  section {
    margin: 0 auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  section :global(.subsubhead) {
    display: block;
    margin-top: 10px;
  }
</style>
