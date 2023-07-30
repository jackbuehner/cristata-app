<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Chip } from '$lib/common/Chip';
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import NewTokenDialog from '$lib/dialogs/NewTokenDialog.svelte';
  import { motionMode } from '$stores/motionMode';
  import { formatISODate } from '$utils/formatISODate';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, Expander, ProgressRing, TextBlock, TextBox, ToggleSwitch } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  export let data;
  $: ({ fathomSecrets } = data);
  $: secrets = $fathomSecrets.data?.configuration?.security.secrets?.fathom;
  $: if (secrets) handleDataUpdate(secrets);

  $: if (browser) document.title = 'Configure Fathom Analytics';

  let showSecrets = false;

  let siteId = '';
  let dashPassword = '';

  let saving = false;

  function handleDataUpdate(_secrets: NonNullable<typeof secrets>) {
    siteId = _secrets.siteId;
    dashPassword = _secrets.dashboardPassword;
  }
</script>

<div class="wrapper">
  <div class="header">
    <PageTitle>Configure Fathom Analytics integration</PageTitle>

    <ActionRow>
      {#if true}
        <Button
          variant="accent"
          style="width: 82px;"
          on:click={async () => {
            saving = true;
            await data.saveSecrets([
              { key: 'fathom.siteId', value: siteId },
              { key: 'fathom.dashboardPassword', value: dashPassword },
            ]);
            saving = false;
            $fathomSecrets.refetch();
          }}
          disabled={saving || $fathomSecrets.loading}
        >
          {#if saving}
            <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
          {:else}
            <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
            Save
          {/if}
        </Button>
        <Button
          style="width: 98px;"
          on:click={() => {
            $fathomSecrets.refetch();
          }}
          disabled={saving || $fathomSecrets.loading}
        >
          {#if $fathomSecrets.loading}
            <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
          {:else}
            <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
            Refresh
          {/if}
        </Button>
      {/if}
      <ToggleSwitch bind:checked={showSecrets} disabled={saving || $fathomSecrets.loading}>
        Show secrets
      </ToggleSwitch>
    </ActionRow>

    <div class="text">
      <TextBlock>
        Fathom is a Google Analytics alternative that doesn’t compromise visitor privacy for data. Unlike many
        other analytics providers (including Google Analytics), Fathom is GDPR compliant. Learn more at
        <a href="https://usefathom.com/">usefathom.com</a>.
      </TextBlock>
      <TextBlock style="margin-top: 10px;">
        To enable the Fathom Analytics integration, provide your site ID, save, and then restart Cristata. Only
        administrators will be able to see the integration.
      </TextBlock>
    </div>

    {#key saving || $fathomSecrets.loading}
      <section>
        <FieldWrapper
          label="Site ID"
          forId="fathom-site-id"
          description="If you don’t know your Site ID, log into Fathom, go to Settings > Sites, then your Site ID will be next to the name of your site."
        >
          <TextBox
            bind:value={siteId}
            type={!showSecrets ? 'password' : 'text'}
            disabled={saving || $fathomSecrets.loading}
            autocorrect="off"
            spellcheck="false"
            autocomplete="new-password"
          />
        </FieldWrapper>

        <FieldWrapper
          label="Dashboard password"
          forId="fathom-dash-password"
          description="If your dashboard is public, leave “Fathom share password” blank. If your dashboard is privately shared, then type in the share password."
        >
          <TextBox
            bind:value={dashPassword}
            type={!showSecrets ? 'password' : 'text'}
            autocorrect="off"
            disabled={saving || $fathomSecrets.loading}
            spellcheck="false"
            autocomplete="new-password"
          />
        </FieldWrapper>
      </section>
    {/key}
  </div>
</div>

<style>
  .text {
    margin: 0 auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }
</style>
