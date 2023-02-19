<script lang="ts">
  import { RemoveUserFromTeam, SaveUserDeactivate, SaveUserEdits } from '$graphql/graphql';
  import { server } from '$utils/constants';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, Checkbox, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;
  export let canManage = false;

  export let tenant: string;

  export let team_id: string;
  export let name: string;
  export let slug: string;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  let deleteValue = '';
  $: readyToDelete = deleteValue === `Delete ${slug}`;

  async function saveChanges(): Promise<boolean> {
    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(RemoveUserFromTeam),
        variables: {
          _id: team_id,
          input: {
            organizers: organizers.filter(notEmpty).filter((user) => user !== user_id), // remove user from organizers
            members: members.filter(notEmpty).filter((user) => user !== user_id), // remove user from members
          },
        },
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

    if (hasRetiredChanged) {
      await fetch(`${server.location}/v3/${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: print(SaveUserDeactivate),
          variables: { _id: user_id, retired: deactivate },
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
    }

    return res;
  }
</script>

<ContentDialog
  title="Remove from team?"
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

  Danger! This cannot be undone. Users in the {name} will not be deleted, but users will not longer be able to access
  documents via this team.

  <br />
  <br />
  <div class="field">
    <TextBlock>Confirm delete</TextBlock>
    <TextBlock variant="caption">
      Type "Delete {slug}" to delete this team.
    </TextBlock>
    <TextBox bind:value={deleteValue} />
  </div>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        if (readyToDelete) {
          loadingSubmit = true;
          const success = await saveChanges();
          if (success) {
            await handleAction?.();
            await handleSumbit?.();
            open = false;
          }
          loadingSubmit = false;
        }
      }}
      disabled={!readyToDelete}
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

<style>
  div.field {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
  }
  div.field:last-of-type {
    margin-bottom: 10px;
  }
  div.field > :global(.type-caption) {
    margin-bottom: 6px;
    opacity: 0.8;
  }
</style>
