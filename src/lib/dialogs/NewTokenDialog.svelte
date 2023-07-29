<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { Button, ContentDialog, TextBlock, TextBox } from 'fluent-svelte';

  export let token: string;
  $: open = !!token;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
</script>

<ContentDialog title="Token created" bind:open size="max">
  <TextBlock>
    Your new token has been created. Save it somewhere safe – you will not be able to see it again.
  </TextBlock>

  <div class="token-box">
    <TextBox bind:value={token} readonly />
    <Button
      style="flex-shrink: 0;"
      on:click={() => {
        navigator?.clipboard?.writeText(token);
      }}
    >
      <FluentIcon name="Copy16Regular" mode="buttonIconLeft" />
      Copy token
    </Button>
  </div>

  <svelte:fragment slot="footer">
    <Button
      on:click={async () => {
        await handleAction?.();
        open = false;
      }}
    >
      Close
    </Button>
  </svelte:fragment>
</ContentDialog>

<style>
  .token-box {
    display: flex;
    gap: 10px;
    margin: 10px 0;
  }
</style>
