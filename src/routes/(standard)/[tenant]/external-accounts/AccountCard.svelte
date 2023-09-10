<script lang="ts">
  import type { ExternalAccountsListQuery } from '$graphql/graphql';
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import DeleteExternalAccountDialog from '$lib/dialogs/DeleteExternalAccountDialog.svelte';
  import ModifyExternalAccountDialog from '$lib/dialogs/EditExternalAccountDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { isURL } from '$utils/isURL';
  import { IconButton, TextBox } from 'fluent-svelte';

  export let account: NonNullable<
    NonNullable<NonNullable<ExternalAccountsListQuery['externalAccounts']>['docs']>[0]
  >;
  export let index: number;
  export let tenant: string;
  export let refetch: () => Promise<void>;

  let modifyExternalAccountRecordDialogOpen = false;
  let counter = 0;
  let deleteExternalAccountRecordDialogOpen = false;
</script>

<article class:compact={$compactMode}>
  <div class="top">
    <h1>{account.name || 'Account'}</h1>
    <div class="buttons">
      {#if account.website && isURL(account.website)}
        <IconButton href={account.website} target="_blank" rel="noreferrer noopener">
          <FluentIcon name="Open24Regular" />
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
    width: 65px;
  }
  article.compact :global(div.field .field-label > *:not(:first-child)) {
    display: none;
  }
</style>
