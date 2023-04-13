<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { StatelessCheckbox } from '$lib/common/Checkbox/index.js';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import { motionMode } from '$stores/motionMode';
  import { server } from '$utils/constants.js';
  import { Button, Expander, InfoBar, ProgressRing, TextBlock } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  export let data;
  $: ({ billingStatus } = data);

  $: if (browser) document.title = 'Payments & invoices';

  let updating = false;
  let error = '';

  $: canceled = $page.url.searchParams.get('canceled');
</script>

<PageTitle>Payments & invoices</PageTitle>

<ActionRow>
  <Button
    style="width: 140px;"
    on:click={() => {
      $billingStatus.refetch();
    }}
    disabled={$billingStatus.loading || updating}
  >
    {#if $billingStatus.loading || updating}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
      Refresh status
    {/if}
  </Button>
</ActionRow>

{#if error}
  <div class="error">
    <InfoBar severity="critical" title="Failed to save changes">{error}</InfoBar>
  </div>
{/if}

{#if $billingStatus.data}
  <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
    {#if $billingStatus.errors}
      <div class="error">
        <InfoBar severity="critical" title="Failed to save changes">
          {JSON.stringify($billingStatus.errors)}
        </InfoBar>
      </div>
    {:else if $billingStatus.data?.billing.subscription_active}
      <PageSubtitle caption="Thank you!">You are currently subscribed to Cristata</PageSubtitle>
      <section>
        <form
          style="margin-top: 10px;"
          action={`${server.location}/stripe/create-portal-session`}
          method="POST"
        >
          <Button type="submit">Manage your billing information</Button>
        </form>
        <form
          style="margin-top: 10px;"
          action={`${server.location}/stripe/create-portal-session`}
          method="POST"
        >
          <Button type="submit">View invoices</Button>
        </form>
        <Expander expanded style="margin-top: 10px;">
          Advanced options
          <svelte:fragment slot="content">
            <StatelessCheckbox
              disabled={$billingStatus.loading || updating}
              checked={$billingStatus.data.billing.features.allowDiskUse}
              on:change={(evt) => {
                updating = true;
                fetch(`${server.location}/v3/${data.authUser.tenant}`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    query: `
                  mutation SetAllowDiskUse($allowDiskUse: Boolean!) {
                    billing {
                      features {
                        allowDiskUse(allowDiskUse: $allowDiskUse)
                      }
                    }
                  }
                `,
                    variables: { allowDiskUse: evt.detail.checked || false },
                  }),
                })
                  .finally(() => {
                    error = '';
                    updating = false;
                  })
                  .then((res) => {
                    if (res.status === 200) {
                      $billingStatus.refetch();
                    } else throw new Error(`${res.status}: ${res.statusText}`);
                  })
                  .catch((err) => {
                    error = `Failed to change disk use subscription setting. (${err.message})`;
                  });
              }}
            >
              Allow using disk space when query memory exceeds the limit ($0.03 / hour)
            </StatelessCheckbox>
            <TextBlock style="margin-left: 28px; opacity: 0.8;">
              This ensures that high-memory queries can finish executing. It is only necessary to enable if your
              queries get the <code>QueryExceededMemoryLimitNoDiskUseAllowed</code> error.
            </TextBlock>
          </svelte:fragment>
        </Expander>
      </section>
    {:else if canceled}
      <PageSubtitle caption=":(">Subscription cancelled</PageSubtitle>
    {:else}
      <PageSubtitle
        caption="Start paying for Cristata to create unlimited documents and users and access your data from anywhere."
      >
        You are currently in trial mode
      </PageSubtitle>
      <section>
        <form
          style="margin-top: 10px;"
          action={`${server.location}/stripe/create-checkout-session`}
          method="POST"
        >
          <Button type="submit">Subscribe</Button>
        </form>
        {#if $billingStatus.data?.billing.stripe_customer_id}
          <form
            style="margin-top: 10px;"
            action={`${server.location}/stripe/create-portal-session`}
            method="POST"
          >
            <Button type="submit">Manage your billing information</Button>
          </form>
          <form
            style="margin-top: 10px;"
            action={`${server.location}/stripe/create-portal-session`}
            method="POST"
          >
            <Button type="submit">View invoices</Button>
          </form>
        {/if}
      </section>
    {/if}
  </div>
{/if}

<style>
  section,
  .error {
    margin: 0 auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }
</style>
