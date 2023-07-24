<script lang="ts">
  import { Button, ContentDialog, TextBlock } from 'fluent-svelte';

  export let open = false;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
</script>

<ContentDialog title="No need to manually save" bind:open size="standard">
  <TextBlock>Changes to all document fields are synced and saved automatically.</TextBlock>

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
