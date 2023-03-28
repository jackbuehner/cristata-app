<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import AddTeamMemberDialog from '$lib/dialogs/AddTeamMemberDialog.svelte';
  import DeleteTeamDialog from '$lib/dialogs/DeleteTeamDialog.svelte';
  import ManageTeamDialog from '$lib/dialogs/ManageTeamDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, ProgressRing, TextBlock } from 'fluent-svelte';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';
  import PersonCard from './PersonCard.svelte';

  export let data: PageData;
  $: ({ team, fieldDescriptions } = data);
  $: profilesFieldDescriptions = $fieldDescriptions.data?.configuration?.apps.profiles.fieldDescriptions;

  $: name = $team.data?.team?.name || $page.url.searchParams.get('name');

  let loading = false;
  let listWidth = 1000;
  let flyoutOpen: Record<string, boolean> = {};

  // allow items (e.g. text and person cards) to fly in, but only after the page
  // has initially transitioned in (after 270 ms)
  let canFlyItems = false;
  $: {
    if ($team?.data?.team?.members) {
      setTimeout(() => {
        canFlyItems = true;
      }, 270);
    } else {
      canFlyItems = false;
    }
  }

  let addMemberDialogOpen = false;
  let addOrganizerDialogOpen = false;
  let deleteTeamDialogOpen = false;
  let manageTeamDialogOpen = false;

  $: canModifyTeam = $team.data?.teamActionAccess?.modify;
  $: canHideTeam = $team.data?.teamActionAccess?.hide;
</script>

<PageTitle>{name || 'Team'}</PageTitle>

<ActionRow>
  {#if canModifyTeam}
    <Button
      variant="accent"
      disabled={loading || !$team.data?.team}
      on:click={() => (manageTeamDialogOpen = !manageTeamDialogOpen)}
    >
      <FluentIcon name="Settings16Regular" mode="buttonIconLeft" />
      Manage team
    </Button>
  {/if}
  <Button
    disabled={loading || !$team.data?.team}
    on:click={async () => {
      loading = true;
      await $team.refetch();
      loading = false;
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
  {#if canHideTeam}
    <Button
      disabled={loading || !$team.data?.team}
      on:click={() => (deleteTeamDialogOpen = !deleteTeamDialogOpen)}
    >
      <FluentIcon name="Delete16Regular" mode="buttonIconLeft" />
      Delete team
    </Button>
  {/if}
</ActionRow>

{#if $team.data?.team}
  <div in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
    <PageSubtitle style="width: 100%;">
      <div class="subtitle-row">
        <span style="flex-grow: 1;">Organizers</span>
        <Button on:click={() => (addOrganizerDialogOpen = !addOrganizerDialogOpen)}>Add organizer</Button>
      </div>
    </PageSubtitle>

    <section
      class="person-list"
      bind:clientWidth={listWidth}
      class:small={listWidth < 500}
      class:compact={$compactMode}
    >
      {#if ($team.data?.team?.organizers || []).length === 0}
        <div
          in:fly={{ y: canFlyItems ? 40 : 0, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
        >
          <TextBlock>This team has no organizers.</TextBlock>
        </div>
      {/if}
      {#each ($team.data?.team?.organizers || [])
        .filter(notEmpty)
        .sort((a, b) => a.name.localeCompare(b.name)) as person}
        {#if $team.data?.team}
          <PersonCard
            {person}
            bind:open={flyoutOpen[person._id]}
            bind:loading
            team={$team.data.team}
            canDeactivate={$team.data.userActionAccess?.deactivate || false}
            afterSaveChange={async () => {
              await $team.refetch();
            }}
            flyIn={canFlyItems}
          />
        {/if}
      {/each}
    </section>

    <PageSubtitle style="width: 100%;">
      <div class="subtitle-row">
        <span style="flex-grow: 1;">Members</span>
        <Button on:click={() => (addMemberDialogOpen = !addMemberDialogOpen)}>Add member</Button>
      </div>
    </PageSubtitle>

    <section
      class="person-list"
      bind:clientWidth={listWidth}
      class:small={listWidth < 500}
      class:compact={$compactMode}
    >
      {#if ($team.data?.team?.members || []).length === 0}
        <div
          in:fly={{ y: canFlyItems ? 40 : 0, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
        >
          <TextBlock>This team has no regular members.</TextBlock>
        </div>
      {/if}
      {#each ($team.data?.team?.members || [])
        .filter(notEmpty)
        .sort((a, b) => a.name.localeCompare(b.name)) as person}
        {#if $team.data?.team}
          <PersonCard
            {person}
            bind:open={flyoutOpen[person._id]}
            bind:loading
            team={$team.data.team}
            canDeactivate={$team.data.userActionAccess?.deactivate || false}
            afterSaveChange={async () => {
              await $team.refetch();
            }}
            flyIn={canFlyItems}
          />
        {/if}
      {/each}
    </section>
  </div>

  {#key $team.data?.team}
    {#if $team.data?.team}
      <AddTeamMemberDialog
        bind:open={addMemberDialogOpen}
        team_id={$team.data.team._id}
        members={$team.data.team.members.filter(notEmpty).map(({ _id }) => _id)}
        organizers={$team.data.team.organizers.filter(notEmpty).map(({ _id }) => _id)}
        tenant={data.authUser.tenant}
        {profilesFieldDescriptions}
        basicProfiles={data.basicProfiles}
        mode="member"
        handleSumbit={async () => {
          loading = true;
          await $team.refetch();
          loading = false;
        }}
      />
      <AddTeamMemberDialog
        bind:open={addOrganizerDialogOpen}
        team_id={$team.data.team._id}
        members={$team.data.team.members.filter(notEmpty).map(({ _id }) => _id)}
        organizers={$team.data.team.organizers.filter(notEmpty).map(({ _id }) => _id)}
        tenant={data.authUser.tenant}
        {profilesFieldDescriptions}
        basicProfiles={data.basicProfiles}
        mode="organizer"
        handleSumbit={async () => {
          loading = true;
          await $team.refetch();
          loading = false;
        }}
      />
      {#if canHideTeam}
        <DeleteTeamDialog
          bind:open={deleteTeamDialogOpen}
          team_id={$team.data.team._id}
          name={$team.data.team.name}
          slug={$team.data.team.slug}
          tenant={data.authUser.tenant}
          handleSumbit={async () => {
            loading = true;
            await $team.refetch();
            loading = false;
          }}
        />
      {/if}
      {#if canModifyTeam}
        <ManageTeamDialog
          bind:open={manageTeamDialogOpen}
          _id={$team.data.team._id}
          name={$team.data.team.name}
          members={$team.data.team.members.filter(notEmpty).map(({ _id, name }) => ({ _id, label: name }))}
          organizers={$team.data.team.organizers
            .filter(notEmpty)
            .map(({ _id, name }) => ({ _id, label: name }))}
          tenant={data.authUser.tenant}
          handleSumbit={async () => {
            loading = true;
            await $team.refetch();
            loading = false;
          }}
        />
      {/if}
    {/if}
  {/key}
{:else}
  <div style="padding: 0 20px; max-width: 1000px; margin: 0 auto;">
    <Loading message={name ? `Loading ${name} team...` : 'Loading team...'} style="margin-top: 20px;" />
  </div>
{/if}

<style>
  section {
    margin: 10px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  section.person-list {
    display: flex;
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
  }

  section.person-list.compact {
    gap: 8px;
  }

  section.person-list.small > :global(.person-card),
  section.person-list.small > :global(.person-card .button) {
    width: 100%;
    justify-content: flex-start;
  }

  .subtitle-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
</style>
