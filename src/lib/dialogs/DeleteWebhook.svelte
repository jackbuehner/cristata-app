<script lang="ts">
  import { DeleteWebhook } from '$graphql/graphql';
  import { server } from '$utils/constants';
  import { Button, ContentDialog, InfoBar, ProgressRing } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;

  export let tenant: string;

  export let _id: string;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function deleteWebhook(_id: string): Promise<boolean> {
    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(DeleteWebhook),
        variables: { _id },
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          } else {
            return true;
          }
        }
        error = `${res.status} ${res.statusText}`;
        return false;
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });

    return res;
  }
</script>

<ContentDialog
  title="Delete webhook?"
  bind:open
  size="standard"
  style="
        max-height: calc(100vh - env(titlebar-area-height, 32px) - 40px);
        margin-top: 20px;
      "
>
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to save changes">{error}</InfoBar>
    </div>
  {/if}

  <InfoBar severity="caution" title="This action is permanent." closable={false} />

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={_id?.length !== 24}
      on:click={async () => {
        if (_id?.length === 24) {
          loadingSubmit = true;
          const success = await deleteWebhook(_id);
          if (success) {
            await handleAction?.();
            await handleSumbit?.();
            open = false;
          }
          loadingSubmit = false;
        }
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Yes, delete webhook
      {/if}
    </Button>
    <Button
      on:click={async () => {
        if (hasChanged) {
          loadingCancel = true;
          await handleAction?.();
          await handleCancel?.();
          loadingCancel = false;
        }
        open = false;
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        No, cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>
