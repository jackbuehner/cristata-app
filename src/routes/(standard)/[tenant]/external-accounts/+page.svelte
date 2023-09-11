<script lang="ts">
  import { browser } from '$app/environment';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import CreateExternalAccountDialog from '$lib/dialogs/CreateExternalAccountDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, ProgressRing, TextBlock, Tooltip } from 'fluent-svelte';
  import AccountCard from './AccountCard.svelte';

  export let data;
  $: ({ externalAccountsList } = data);

  $: {
    if (browser) {
      document.title = `External accounts - Cristata`;
    }
  }

  let createNewExternalAccountRecordDialogOpen = false;
  let createNewExternalAccountRecordDialogCounter = 0;
  $: loading = $externalAccountsList.loading;
</script>

<div class="header">
  <PageTitle fullWidth>External accounts</PageTitle>

  <ActionRow fullWidth>
    <Tooltip
      text={(() => {
        if (!data.collection.config.canCreateAndGet) {
          return 'You do not have permission to create records in this collection.';
        }
        return undefined;
      })()}
      offset={4}
      placement="bottom"
      alignment="start"
    >
      <Button
        variant="accent"
        disabled={!data.collection.config.canCreateAndGet || loading}
        on:click={() => {
          createNewExternalAccountRecordDialogCounter++;
          setTimeout(() => {
            createNewExternalAccountRecordDialogOpen = !createNewExternalAccountRecordDialogOpen;
          }, 1);
        }}
      >
        <FluentIcon name="DocumentAdd16Regular" mode="buttonIconLeft" />
        Add new record
      </Button>
    </Tooltip>

    <Button
      disabled={loading}
      on:click={async () => {
        await $externalAccountsList.refetch();
      }}
      style="width: 130px;"
    >
      {#if loading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
        Refresh data
      {/if}
    </Button>
  </ActionRow>
</div>

<div class="grid" class:compact={$compactMode}>
  {#each ($externalAccountsList.data?.externalAccounts?.docs || []).filter(notEmpty) as account, index}
    <AccountCard {account} {index} tenant={data.authUser.tenant} refetch={$externalAccountsList.refetch} />
  {:else}
    <TextBlock>There are no external accounts stored in your tenant.</TextBlock>
  {/each}
</div>

<CreateExternalAccountDialog
  bind:open={createNewExternalAccountRecordDialogOpen}
  tenant={data.authUser.tenant}
  handleSumbit={async () => {
    await $externalAccountsList.refetch();
  }}
/>

<style>
  .grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px;
    padding: 0 20px 20px 20px;
  }
  .grid.compact {
    gap: 10px;
  }
</style>
