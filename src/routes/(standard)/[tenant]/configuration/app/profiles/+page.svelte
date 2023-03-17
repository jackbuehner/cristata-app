<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import ActionAccessCard from '$lib/configuration/ActionAccessCard.svelte';
  import { stringifyArray } from '$utils/stringifyArray';
  import type { Collection } from '@jackbuehner/cristata-api/dist/types/config';
  import { Button, ProgressRing, TextBox } from 'fluent-svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ profilesAppConfig } = data);

  $: defaultFieldDescriptions = $profilesAppConfig.data?.configuration?.apps.profiles.defaultFieldDescriptions;
  $: fieldDescriptions = $profilesAppConfig.data?.configuration?.apps.profiles.fieldDescriptions;
  $: rawCollection = $profilesAppConfig.data?.configuration?.collection?.raw;
  $: actionAccess = (JSON.parse(rawCollection || '{}') as Collection)?.actionAccess;

  let nameFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$profilesAppConfig.loading && nameFieldCaption === ' ') {
    nameFieldCaption = fieldDescriptions.name;
  }

  let emailFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$profilesAppConfig.loading && emailFieldCaption === ' ') {
    emailFieldCaption = fieldDescriptions.email;
  }

  let phoneFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$profilesAppConfig.loading && phoneFieldCaption === ' ') {
    phoneFieldCaption = fieldDescriptions.phone;
  }

  let twitterFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$profilesAppConfig.loading && twitterFieldCaption === ' ') {
    twitterFieldCaption = fieldDescriptions.twitter;
  }

  let bioFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$profilesAppConfig.loading && bioFieldCaption === ' ') {
    bioFieldCaption = fieldDescriptions.biography;
  }

  let titleFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$profilesAppConfig.loading && titleFieldCaption === ' ') {
    titleFieldCaption = fieldDescriptions.title;
  }

  type AA = typeof actionAccess.modify.users;

  let getUsers: AA = [' '];
  $: if (actionAccess && !$profilesAppConfig.loading && getUsers[0] === ' ') {
    getUsers = actionAccess.get.users;
  }
  let getTeams: AA = [' '];
  $: if (actionAccess && !$profilesAppConfig.loading && getTeams[0] === ' ') {
    getTeams = actionAccess.get.teams;
  }

  let modifyUsers: AA = [' '];
  $: if (actionAccess && !$profilesAppConfig.loading && modifyUsers[0] === ' ') {
    modifyUsers = actionAccess.modify.users;
  }
  let modifyTeams: AA = [' '];
  $: if (actionAccess && !$profilesAppConfig.loading && modifyTeams[0] === ' ') {
    modifyTeams = actionAccess.modify.teams;
  }

  let createUsers: AA = [' '];
  $: if (actionAccess && !$profilesAppConfig.loading && createUsers[0] === ' ') {
    createUsers = actionAccess.create.users;
  }
  let createTeams: AA = [' '];
  $: if (actionAccess && !$profilesAppConfig.loading && createTeams[0] === ' ') {
    createTeams = actionAccess.create.teams;
  }

  let deactivateUsers: AA = [' '];
  $: if (actionAccess?.deactivate && !$profilesAppConfig.loading && deactivateUsers[0] === ' ') {
    deactivateUsers = actionAccess.deactivate.users;
  }
  let deactivateTeams: AA = [' '];
  $: if (actionAccess?.deactivate && !$profilesAppConfig.loading && deactivateTeams[0] === ' ') {
    deactivateTeams = actionAccess.deactivate.teams;
  }

  onMount(() => {
    document.title = 'Configure profiles app';
  });

  function cleanArray(arr: (string | 0)[]): string[] {
    // The `stringifyArray` function converts the action access arrays to provide the number `0` as a string `"`"
    // since the API requires strings.
    // The server will convert `"0"` back to `0`.
    return stringifyArray(arr.filter((value) => value !== ' '));
  }

  let saving = false;

  function saveChanges() {
    saving = true;
    data
      .saveProfilesAppConfigChanges({
        fieldDescriptions: {
          name: nameFieldCaption,
          email: emailFieldCaption,
          phone: phoneFieldCaption,
          twitter: twitterFieldCaption,
          biography: bioFieldCaption,
          title: titleFieldCaption,
        },
        actionAccess: {
          get: { users: cleanArray(getUsers), teams: cleanArray(getTeams) },
          create: { users: cleanArray(createUsers), teams: cleanArray(createTeams) },
          modify: { users: cleanArray(modifyUsers), teams: cleanArray(modifyTeams) },
          deactivate: { users: stringifyArray(deactivateUsers), teams: cleanArray(deactivateTeams) },
        },
      })
      .finally(() => {
        saving = false;
        $profilesAppConfig.refetch();
      });
  }
</script>

<PageTitle>Configure profiles app</PageTitle>

<ActionRow>
  {#if true}
    <Button
      variant="accent"
      style="width: 174px;"
      on:click={saveChanges}
      disabled={$profilesAppConfig.loading || saving}
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
        nameFieldCaption = ' ';
        emailFieldCaption = ' ';
        phoneFieldCaption = ' ';
        twitterFieldCaption = ' ';
        bioFieldCaption = ' ';
        titleFieldCaption = ' ';

        getUsers = [' '];
        getTeams = [' '];
        createUsers = [' '];
        createTeams = [' '];
        modifyUsers = [' '];
        modifyTeams = [' '];
        deactivateUsers = [' '];
        deactivateTeams = [' '];

        $profilesAppConfig.refetch();
      }}
      disabled={$profilesAppConfig.loading || saving}
    >
      {#if $profilesAppConfig.loading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
        Discard changes
      {/if}
    </Button>
  {/if}
</ActionRow>

<PageSubtitle caption="Choose the descriptions (help text) that appear under each field in the profile editor">
  Custom field descriptions
</PageSubtitle>

<section>
  <FieldWrapper label="Name" forId="custom-description-name">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-name" bind:value={nameFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $profilesAppConfig.loading ||
          nameFieldCaption === defaultFieldDescriptions.name}
        on:click={() => {
          if (defaultFieldDescriptions) nameFieldCaption = defaultFieldDescriptions.name;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Email address" forId="custom-description-email">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-email" bind:value={emailFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $profilesAppConfig.loading ||
          emailFieldCaption === defaultFieldDescriptions.email}
        on:click={() => {
          if (defaultFieldDescriptions) emailFieldCaption = defaultFieldDescriptions.email;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Phone" forId="custom-description-phone">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-phone" bind:value={phoneFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $profilesAppConfig.loading ||
          phoneFieldCaption === defaultFieldDescriptions.phone}
        on:click={() => {
          if (defaultFieldDescriptions) phoneFieldCaption = defaultFieldDescriptions.phone;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Twitter" forId="custom-description-twitter">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-twitter" bind:value={twitterFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $profilesAppConfig.loading ||
          twitterFieldCaption === defaultFieldDescriptions.twitter}
        on:click={() => {
          if (defaultFieldDescriptions) twitterFieldCaption = defaultFieldDescriptions.twitter;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Biography" forId="custom-description-biography">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-biography" bind:value={bioFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $profilesAppConfig.loading ||
          bioFieldCaption === defaultFieldDescriptions.biography}
        on:click={() => {
          if (defaultFieldDescriptions) bioFieldCaption = defaultFieldDescriptions.biography;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Title" forId="custom-description-title">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-title" bind:value={titleFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $profilesAppConfig.loading ||
          titleFieldCaption === defaultFieldDescriptions.title}
        on:click={() => {
          if (defaultFieldDescriptions) titleFieldCaption = defaultFieldDescriptions.title;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>
</section>

<PageSubtitle
  caption="Choose which users and teams can add, remove, edit, and deactivate users. Users can always edit their own name, email, phone, twitter, and biography."
>
  Permissions
</PageSubtitle>

<section>
  <div class="action-grid">
    <ActionAccessCard bind:users={getUsers} bind:teams={getTeams}>View profiles</ActionAccessCard>
    <ActionAccessCard bind:users={createUsers} bind:teams={createTeams}>Create profiles</ActionAccessCard>
    <ActionAccessCard bind:users={modifyUsers} bind:teams={modifyTeams}>Modify profiles</ActionAccessCard>
    <ActionAccessCard bind:users={deactivateUsers} bind:teams={deactivateTeams}>
      Deactivate profiles
    </ActionAccessCard>
  </div>
</section>

<style>
  section {
    margin: 0 auto 30px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  .custom-description-field {
    display: flex;
    flex-direction: row;
    flex-wrap: no-wrap;
    gap: 6px;
  }
  .custom-description-field > :global(.button) {
    white-space: pre;
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 15px;
    margin-top: 15px;
  }
</style>
