<script lang="ts">
  import { goto } from '$app/navigation';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import { PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import CreateTeamDialog from '$lib/dialogs/CreateTeamDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { genAvatar } from '$utils/genAvatar';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, TextBlock } from 'fluent-svelte';
  import PersonCard from '../[team_id]/PersonCard.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ basicTeams, unassignedUsers } = data);

  let createDialogOpen = false;
  let width = 1000;
</script>

<PageTitle>Teams</PageTitle>

<div class="button-row">
  {#if true}
    <Button variant="accent" on:click={() => (createDialogOpen = true)}>
      <FluentIcon name="PeopleAdd16Regular" mode="buttonIconLeft" />
      Create team
    </Button>
    <CreateTeamDialog
      tenant={data.authUser.tenant}
      bind:open={createDialogOpen}
      handleSumbit={async (_id) => {
        await $basicTeams.refetch();
        goto(`/${data.authUser.tenant}/teams/${_id}`);
      }}
    />
  {/if}
</div>

<section class="teams-list" bind:clientWidth={width} class:small={width < 500} class:compact={$compactMode}>
  {#if $basicTeams.loading}
    <Loading message="Downloading teams..." style="margin-top: 20px;" />
  {:else}
    {#each ($basicTeams.data?.teams?.docs || []).filter(notEmpty) as team}
      {@const membersCount = team.organizers?.length + team.members?.length || 0}
      <Button href="/{data.authUser.tenant}/teams/{team._id}?name={encodeURIComponent(team.name)}">
        <article>
          <img src={genAvatar(team._id, 36, 'bauhaus')} alt="" class="team-photo" />
          <div class="team-meta">
            <TextBlock>{team.name}</TextBlock>
            <TextBlock>{membersCount} {membersCount === 1 ? 'member' : 'members'}</TextBlock>
          </div>
        </article>
      </Button>
    {/each}
  {/if}
</section>

{#if ($unassignedUsers.data?.teamUnassignedUsers || []).length > 0}
  <PageSubtitle>Active users without teams</PageSubtitle>

  <section class="unassigned-users" class:small={width < 500} class:compact={$compactMode}>
    {#each ($unassignedUsers.data?.teamUnassignedUsers || [])
      .filter(notEmpty)
      .sort((a, b) => a.name.localeCompare(b.name)) as person}
      <PersonCard {person} />
    {/each}
  </section>
{/if}

<style>
  section {
    margin: 10px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  section.teams-list {
    display: flex;
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
  }

  section.teams-list.small > :global(.button) {
    width: 100%;
    justify-content: flex-start;
  }

  section.unassigned-users {
    display: flex;
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
  }

  section.unassigned-users.compact,
  section.teams-list.compact {
    gap: 8px;
  }

  article {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 4px;
  }

  .team-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  img.team-photo {
    border-radius: var(--fds-control-corner-radius);
    box-shadow: inset 0 0 0 1.5px black;
    -webkit-user-drag: none;
    width: 36px;
    height: 36px;
  }

  .button-row {
    margin: 20px auto;
    padding: 0 20px;
    max-width: 1000px;
    display: flex;
    gap: 10px;
  }
</style>
