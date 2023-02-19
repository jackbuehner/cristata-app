<script lang="ts">
  import { ReferenceMany } from '$components/ContentField';
  import { RemoveUserFromTeam } from '$graphql/graphql';
  import { server } from '$utils/constants';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;

  export let tenant: string;

  type UnpopulatedValue = { _id: string; label?: string };

  export let _id: string;
  export let name: string;
  export let members: UnpopulatedValue[];
  export let organizers: UnpopulatedValue[];

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function saveChanges(): Promise<boolean> {
    const memberIds = members.map(({ _id }) => _id);
    const organizerIds = organizers.map(({ _id }) => _id);

    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(RemoveUserFromTeam),
        variables: {
          _id,
          input: {
            name: name ?? undefined,
            members: memberIds.filter((_id) => !organizerIds.includes(_id)) ?? undefined,
            organizers: organizerIds ?? undefined,
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

    return res;
  }
</script>

<ContentDialog
  title="Edit profile"
  bind:open
  trapFocus={false}
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

  <div class="field">
    <TextBlock>Name</TextBlock>
    <TextBlock variant="caption">
      The display name of the team. Changing this will not affect the team ID or the team slug.
    </TextBlock>
    <TextBox type="text" bind:value={name} on:change={() => (hasChanged = true)} />
  </div>

  <div class="field nocaption">
    <TextBlock>Organizers</TextBlock>
    <react:ReferenceMany
      label="__in-select"
      collection="User"
      values={organizers}
      onChange={(newValues) => {
        organizers = newValues;
      }}
    />
  </div>

  <div class="field nocaption">
    <TextBlock>Members</TextBlock>
    <react:ReferenceMany
      label="__in-select"
      collection="User"
      values={members}
      onChange={(newValues) => {
        members = newValues;
      }}
    />
  </div>

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
        Save changes
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
        Discard changes
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
  div.field.nocaption > :global(.type-body) {
    margin-bottom: 6px;
  }
  div.field > :global(.type-caption) {
    margin-bottom: 6px;
    opacity: 0.8;
  }
</style>
