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
  export let organizers: string[];
  export let members: string[];

  export let user_id: string;
  export let retired: boolean;
  let deactivate = false;
  export let name: string;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let hasRetiredChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

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

  {name} will be removed from this team. They will lose access to resources shared with this team.

  {#if canManage && !retired}
    <br />
    <br />
    <div class="field">
      <TextBlock>Deactivation</TextBlock>
      <TextBlock variant="caption">
        {name} will no longer be able to sign in to Cristata if you deactivate their account.
      </TextBlock>
      <Checkbox
        bind:checked={deactivate}
        on:change={() => {
          hasChanged = true;
          hasRetiredChanged = true;
        }}
      >
        Also deactivate this account
      </Checkbox>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        loadingSubmit = true;
        const success = await saveChanges();
        if (success) {
          await handleAction?.();
          await handleSumbit?.();
          open = false;
        }
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Yes, remove
        {#if deactivate}
          and deactivate
        {/if}
      {/if}
    </Button>
    <Button
      on:click={async () => {
        if (hasChanged || hasRetiredChanged) {
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
