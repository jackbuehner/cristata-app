<script lang="ts">
  import { MultiSelect } from '$components/Select';
  import { CreateTeam, SaveUserDeactivate, SaveUserEdits } from '$graphql/graphql';
  import { SelectMany, type Option } from '$lib/common/Select';
  import { selectProfile } from '$react/teams/selectProfile';
  import { server } from '$utils/constants';
  import { slugify } from '$utils/slugify';
  import { Button, Checkbox, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;

  export let tenant: string;

  let name = '';
  $: slug = slugify(name);
  let members: Option[] = [];
  let organizers: Option[] = [];

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((_id: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let hasRetiredChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function saveChanges(): Promise<false | string> {
    return await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CreateTeam),
        variables: {
          name,
          slug,
          members: members.map((opt) => opt._id),
          organizers: organizers.map((opt) => opt._id),
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
            return json.data?.teamCreate?._id || true;
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
</script>

<ContentDialog
  title="Create team"
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

  <div class="field">
    <TextBlock>Team name</TextBlock>
    <TextBlock variant="caption">The name of this team. It can be updated later.</TextBlock>
    <TextBox type="text" bind:value={name} on:change={() => (hasChanged = true)} />
  </div>

  <div class="field">
    <TextBlock>Team slug</TextBlock>
    <TextBlock variant="caption">
      Automatically generated based on the team name. Once set, it cannot be changed.
    </TextBlock>
    <TextBox type="text" value={slug} on:change={() => (hasChanged = true)} disabled />
  </div>

  <div class="field">
    <TextBlock>Organizers</TextBlock>
    <TextBlock variant="caption">The people in charge of this team.</TextBlock>
    <SelectMany
      reference={{
        collection: 'User',
      }}
      bind:selectedOptions={organizers}
    />
  </div>

  <div class="field">
    <TextBlock>Members</TextBlock>
    <TextBlock variant="caption">Let everyone know where to follow you.</TextBlock>
    <SelectMany
      reference={{
        collection: 'User',
      }}
      bind:selectedOptions={members}
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
          await handleSumbit?.(success);
          open = false;
          name = '';
          members = [];
          organizers = [];
        }
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Create team
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
        name = '';
        members = [];
        organizers = [];
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Cancel
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
