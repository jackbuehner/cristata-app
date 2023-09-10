<script lang="ts">
  import { DeleteExternalAccount } from '$graphql/graphql';
  import { FieldWrapper } from '$lib/common/Field';
  import { server } from '$utils/constants';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;

  export let tenant: string;

  export let _id: string;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((_id: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function saveChanges(): Promise<false | string> {
    return await fetch(`${server.location}/v3/${tenant}?EditExternalAccount`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(DeleteExternalAccount),
        variables: { _id },
      }),
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');

        if (contentType && contentType.indexOf('application/json') !== -1) {
          const json = await res.json();

          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          }

          if (res.ok) {
            return json.data?.externalAccountCreate?._id || true;
          }

          error = `${res.status} ${res.statusText}`;
          return false;
        }
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });
  }
</script>

<ContentDialog
  title="Delete external account record?"
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

  <InfoBar severity="caution" title="This action is permanent." />

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        loadingSubmit = true;
        const success = await saveChanges();
        if (success) {
          await handleAction?.();
          await handleSumbit?.(success);
          open = false;
        }
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Yes, delete
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
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
