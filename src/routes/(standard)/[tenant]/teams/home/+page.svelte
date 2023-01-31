<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { queryCacheStore } from '$graphql/query';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import CreateTeamDialog from '$lib/dialogs/CreateTeamDialog.svelte';
  import { TeamsOverviewPage } from '$react/teams/TeamsOverviewPage';
  import { genAvatar } from '$utils/genAvatar';
  import { Button, TextBlock } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let createDialogOpen = false;
  let width = 1000;

  /**
   * Removes cached data for the specified query
   * @param key the name of the query
   * @param refresh if the page should also refresh to potentially regenerate the value in the cache
   */
  function invalidateQueryCache(key: string, refresh = true) {
    queryCacheStore.update((value) => {
      delete value[key];
      return { ...value };
    });
    if (refresh) goto($page.url.pathname + '/');
  }
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
        invalidateQueryCache('TeamsList', false);
        goto(`/${data.authUser.tenant}/teams/${_id}`);
      }}
    />
  {/if}
</div>

<section class="teams-list" bind:clientWidth={width} class:small={width < 500}>
  {#each data.basicTeams || [] as team}
    {@const membersCount = team.organizers?.length + team.members?.length || 0}
    <Button href="/{data.authUser.tenant}/teams/{team._id}">
      <article>
        <img src={genAvatar(team._id, 36, 'bauhaus')} alt="" class="team-photo" />
        <div class="team-meta">
          <TextBlock>{team.name}</TextBlock>
          <TextBlock>{membersCount} {membersCount === 1 ? 'member' : 'members'}</TextBlock>
        </div>
      </article>
    </Button>
  {/each}
</section>

<section class="unassigned-users">
  <react:TeamsOverviewPage />
</section>

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
