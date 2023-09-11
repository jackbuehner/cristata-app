<script lang="ts">
  import type { ExternalAccountsListQuery } from '$graphql/graphql';
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import AddTotpToExternalAccountDialog from '$lib/dialogs/AddTotpToExternalAccountDialog.svelte';
  import DeleteExternalAccountDialog from '$lib/dialogs/DeleteExternalAccountDialog.svelte';
  import ModifyExternalAccountDialog from '$lib/dialogs/EditExternalAccountDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { isURL } from '$utils/isURL';
  import { jsOTP } from '$utils/jsOTP';
  import { Button, IconButton, TextBox } from 'fluent-svelte';

  export let account: NonNullable<
    NonNullable<NonNullable<ExternalAccountsListQuery['externalAccounts']>['docs']>[0]
  >;
  export let index: number;
  export let tenant: string;
  export let refetch: () => Promise<void>;

  let modifyExternalAccountRecordDialogOpen = false;
  let counter = 0;
  let deleteExternalAccountRecordDialogOpen = false;
  let addTotpToExternalAccountRecordDialogOpen = false;

  $: codeDetails = account.mfa?.[0] || undefined;
  $: totp = codeDetails ? new jsOTP.totp(codeDetails.period ?? 30, codeDetails.digits ?? 6) : undefined;

  let timeCode: string;
  function updateTotpCode() {
    if (totp && codeDetails?.secret) {
      timeCode = totp.getOtp(codeDetails.secret);
    }
  }

  let countDown = 0;
  let countDownPercent = 0;
  setInterval(() => {
    if (codeDetails) {
      const epoch = Math.round(new Date().getTime() / 1000.0);
      const period = codeDetails?.period || 30;
      countDown = period - (epoch % period);
      countDownPercent = (countDown / period) * 100;
      if (epoch % period == 0) updateTotpCode();
      if (!timeCode) updateTotpCode();
    }
  }, 1000);
</script>

<article class:compact={$compactMode}>
  <div class="top">
    <h1>{account.name || 'Account'}</h1>
    <div class="buttons">
      {#if account.website && isURL(account.website)}
        <IconButton href={account.website} target="_blank" rel="noreferrer noopener">
          <FluentIcon name="Open24Regular" />s
        </IconButton>
      {/if}
      <IconButton
        on:click={() => (deleteExternalAccountRecordDialogOpen = !deleteExternalAccountRecordDialogOpen)}
      >
        <FluentIcon name="Delete24Regular" />
      </IconButton>
      <IconButton
        on:click={() => (modifyExternalAccountRecordDialogOpen = !modifyExternalAccountRecordDialogOpen)}
      >
        <FluentIcon name="Edit24Regular" />
      </IconButton>
    </div>
  </div>
  <FieldWrapper label="Username" forId="username{index}">
    <TextBox value={account.username} id="username{index}" readonly />
  </FieldWrapper>
  <FieldWrapper label="Password" forId="password{index}">
    <TextBox value={account.password} id="password{index}" type="password" readonly />
  </FieldWrapper>
  {#if account.mfa?.[0]}
    <FieldWrapper
      label="TOTP code"
      forId="2fa{index}"
      style="--progress: {countDownPercent}%; --progressNum: {countDownPercent / 100};"
    >
      <TextBox value={timeCode} id="2fa{index}" class="mfa-box" readonly />
    </FieldWrapper>
  {:else}
    <Button
      style="margin-top: 10px;"
      on:click={() => (addTotpToExternalAccountRecordDialogOpen = !addTotpToExternalAccountRecordDialogOpen)}
    >
      Add two-factor authentication code
    </Button>
  {/if}
</article>
{#key counter}
  <ModifyExternalAccountDialog
    bind:open={modifyExternalAccountRecordDialogOpen}
    {tenant}
    _id={account._id}
    name={account.name}
    website={account.website}
    username={account.username}
    password={account.password}
    hasMfa={!!account.mfa?.[0]}
    handleCancel={async () => {
      counter++;
    }}
    handleSumbit={async () => {
      await refetch();
    }}
  />
{/key}
<DeleteExternalAccountDialog
  bind:open={deleteExternalAccountRecordDialogOpen}
  {tenant}
  _id={account._id}
  handleSumbit={async () => {
    await refetch();
  }}
/>
<AddTotpToExternalAccountDialog
  bind:open={addTotpToExternalAccountRecordDialogOpen}
  {tenant}
  _id={account._id}
  handleSumbit={async () => {
    await refetch();
  }}
/>

<style>
  article {
    border: 1px solid var(--fds-card-stroke-default);
    border-radius: var(--fds-control-corner-radius);

    padding: 30px;
    background-color: var(--fds-card-background-secondary);

    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    width: 350px;
  }
  article.compact {
    padding: 20px;
  }

  .top {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 15px;
    gap: 10px;
  }

  article h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    flex-shrink: 1;
    flex-grow: 1;
  }

  .buttons {
    flex-grow: 0;
    flex-shrink: 0;
  }

  article.compact :global(div.field) {
    flex-direction: row !important;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px !important;
  }
  article.compact :global(div.field .field-label) {
    margin-bottom: 0 !important;
    white-space: normal !important;
    width: 70px;
  }
  article.compact :global(div.field .field-label > *:not(:first-child)) {
    display: none;
  }

  :global(.mfa-box .text-box-underline)::after {
    box-shadow: inset 0 -2px 0 0 rgb(calc(255 - var(--progressNum) * 255), calc(var(--progressNum) * 255), calc(var(
              --progressNum
            ) * 50));
    inline-size: var(--progress) !important;
    transition: inline-size linear 1000ms;
  }
</style>
