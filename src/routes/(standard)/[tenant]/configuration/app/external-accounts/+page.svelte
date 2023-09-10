<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import type { Option } from '$lib/common/Select';
  import ActionAccessCard from '$lib/configuration/ActionAccessCard.svelte';
  import { stringifyArray } from '$utils/stringifyArray';
  import type { Collection } from '@jackbuehner/cristata-api/dist/types/config';
  import { Button, ProgressRing } from 'fluent-svelte';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ externalAccountsAppConfig, fieldDescriptions: appFieldDescriptions } = data);
  $: rawCollection = $externalAccountsAppConfig.data?.configuration?.collection?.raw;

  const actionAccess = writable<Collection['actionAccess'] | undefined>(undefined);
  $: actionAccess.set((JSON.parse(rawCollection || '{}') as Collection)?.actionAccess);

  function adjustUsers(value: string | 0): Option {
    return value === 0 ? { _id: 'any', label: 'Any user' } : { _id: value };
  }
  function adjustTeams(value: string | 0): Option {
    return value === 0 ? { _id: 'any', label: 'Any team' } : { _id: value };
  }

  let getUsers: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    getUsers = actionAccess?.get.users.map(adjustUsers) || [];
  });
  let getTeams: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    getTeams = actionAccess?.get.teams.map(adjustTeams) || [];
  });

  let modifyUsers: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    modifyUsers = actionAccess?.modify.users.map(adjustUsers) || [];
  });
  let modifyTeams: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    modifyTeams = actionAccess?.modify.teams.map(adjustTeams) || [];
  });

  let createUsers: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    createUsers = actionAccess?.create.users.map(adjustUsers) || [];
  });
  let createTeams: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    createTeams = actionAccess?.create.teams.map(adjustTeams) || [];
  });

  let deleteUsers: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    deleteUsers = actionAccess?.delete?.users.map(adjustUsers) || [];
  });
  let deleteTeams: Option[] = [];
  actionAccess.subscribe((actionAccess) => {
    deleteTeams = actionAccess?.delete?.teams.map(adjustTeams) || [];
  });

  onMount(() => {
    document.title = 'Configure external accounts app';
  });

  function cleanArray(arr: Option[]): string[] {
    // The `stringifyArray` function converts the action access arrays to provide the number `0` as a string `"`"
    // since the API requires strings.
    // The server will convert `"0"` back to `0`.
    return stringifyArray(
      arr.map((value) => (value._id === 'any' ? 0 : value._id)).filter((value) => value !== ' ')
    );
  }

  let saving = false;

  function saveChanges() {
    saving = true;
    data
      .saveExternalAccountsAppConfigChanges({
        actionAccess: {
          get: { users: cleanArray(getUsers), teams: cleanArray(getTeams) },
          create: { users: cleanArray(createUsers), teams: cleanArray(createTeams) },
          modify: { users: cleanArray(modifyUsers), teams: cleanArray(modifyTeams) },
          delete: { users: cleanArray(deleteUsers), teams: cleanArray(deleteTeams) },
        },
      })
      .finally(() => {
        saving = false;
        $externalAccountsAppConfig.refetch();
        $appFieldDescriptions.refetch();
      });
  }
</script>

<PageTitle>Configure external accounts app</PageTitle>

<ActionRow>
  {#if true}
    <Button
      variant="accent"
      style="width: 174px;"
      on:click={saveChanges}
      disabled={$externalAccountsAppConfig.loading || saving}
    >
      {#if saving}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
        Save configuration
      {/if}
    </Button>
    <Button
      style="width: 160px;"
      on:click={() => {
        $externalAccountsAppConfig.refetch();
      }}
      disabled={$externalAccountsAppConfig.loading || saving}
    >
      {#if $externalAccountsAppConfig.loading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
        Discard changes
      {/if}
    </Button>
  {/if}
</ActionRow>

<PageSubtitle
  caption="Choose which users and teams can add, remove, edit, and delete external account records."
>
  Permissions
</PageSubtitle>

<section>
  <div class="action-grid">
    <ActionAccessCard bind:users={getUsers} bind:teams={getTeams}>
      View external account records
    </ActionAccessCard>
    <ActionAccessCard bind:users={createUsers} bind:teams={createTeams}>
      Create external account records
    </ActionAccessCard>
    <ActionAccessCard bind:users={modifyUsers} bind:teams={modifyTeams}>
      Modify external account records
    </ActionAccessCard>
    <ActionAccessCard bind:users={deleteUsers} bind:teams={deleteTeams}>
      Delete external account records
    </ActionAccessCard>
  </div>
</section>

<style>
  section {
    margin: 0 auto 30px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 15px;
    margin-top: 15px;
  }
</style>
