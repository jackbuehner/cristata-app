<script lang="ts">
  import { ReferenceOne } from '$components/ContentField';
  import { RemoveUserFromTeam, type FieldDescriptionsQuery } from '$graphql/graphql';
  import { SelectOne, type Option } from '$lib/common/Select';
  import { server } from '$utils/constants';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBlock } from 'fluent-svelte';
  import { print } from 'graphql';
  import type { LayoutDataType } from '../../routes/(standard)/[tenant]/+layout';
  import InviteUserDialog from './InviteUserDialog.svelte';

  type ProfileAppConfig = NonNullable<
    NonNullable<NonNullable<FieldDescriptionsQuery['configuration']>['apps']>['profiles']
  >;
  type FieldDescriptions = Omit<ProfileAppConfig['fieldDescriptions'], '__typename'>;

  export let open = false;

  export let tenant: string;
  export let profilesFieldDescriptions: FieldDescriptions | undefined = undefined;
  export let basicProfiles: LayoutDataType['basicProfiles'];

  export let team_id: string;
  export let organizers: string[];
  export let members: string[];
  export let mode: 'member' | 'organizer';

  let personToAdd: Option | null = null;
  $: personIsAlreadyInTeam = !![...members, ...organizers].find((userId) => userId === personToAdd?._id);

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  let inviteUserDialogOpen = false;

  async function addUser(userIdToAdd: string): Promise<boolean> {
    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(RemoveUserFromTeam),
        variables: {
          _id: team_id,
          input: {
            organizers: (() => {
              if (mode === 'member') return organizers.filter(notEmpty).filter((user) => user !== userIdToAdd);
              return Array.from(new Set([...(organizers || []).filter(notEmpty), userIdToAdd]));
            })(),
            members: (() => {
              if (mode === 'organizer') return members.filter(notEmpty).filter((user) => user !== userIdToAdd);
              return Array.from(new Set([...(members || []).filter(notEmpty), userIdToAdd]));
            })(),
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

  async function handleSave(userIdToAdd: string) {
    loadingSubmit = true;
    const success = await addUser(userIdToAdd);
    if (success) {
      await handleAction?.();
      await handleSumbit?.();
      open = false;
    }
    loadingSubmit = false;
  }

  async function afterInvite(invitedUserId: string) {
    handleSave(invitedUserId);
  }
</script>

<ContentDialog
  title="Add {mode}"
  trapFocus={false}
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

  <div class="field nocaption">
    <TextBlock>Select a person</TextBlock>
    <SelectOne
      reference={{
        collection: 'User',
      }}
      bind:selectedOption={personToAdd}
    />
  </div>

  {#if personIsAlreadyInTeam}
    <InfoBar severity="critical" title="Error" closable={false}>
      This person is already in the team. Select a different person.
    </InfoBar>
  {/if}

  <InfoBar severity="information" title="Need to invite someone new?">
    Use the invitation dialog. They will be added to this team upon invitation.
    <Button slot="action" on:click={() => (inviteUserDialogOpen = true)}>Invite new user</Button>
  </InfoBar>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!personToAdd || personIsAlreadyInTeam}
      on:click={async () => {
        if (personToAdd) {
          await handleSave(personToAdd._id);
        }
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Add {mode}
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
        Cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>

<InviteUserDialog
  bind:open={inviteUserDialogOpen}
  {tenant}
  fieldDescriptions={profilesFieldDescriptions}
  {basicProfiles}
  handleSumbit={afterInvite}
/>

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
