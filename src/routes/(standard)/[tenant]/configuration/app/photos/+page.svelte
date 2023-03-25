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
  $: ({ photosAppConfig, fieldDescriptions: appFieldDescriptions } = data);

  $: defaultFieldDescriptions = $photosAppConfig.data?.configuration?.apps.photos.defaultFieldDescriptions;
  $: fieldDescriptions = $photosAppConfig.data?.configuration?.apps.photos.fieldDescriptions;
  $: rawCollection = $photosAppConfig.data?.configuration?.collection?.raw;
  $: actionAccess = (JSON.parse(rawCollection || '{}') as Collection)?.actionAccess;

  let nameFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$photosAppConfig.loading && nameFieldCaption === ' ') {
    nameFieldCaption = fieldDescriptions.name;
  }

  let sourceFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$photosAppConfig.loading && sourceFieldCaption === ' ') {
    sourceFieldCaption = fieldDescriptions.source;
  }

  let tagsFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$photosAppConfig.loading && tagsFieldCaption === ' ') {
    tagsFieldCaption = fieldDescriptions.tags;
  }

  let requireAuthFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$photosAppConfig.loading && requireAuthFieldCaption === ' ') {
    requireAuthFieldCaption = fieldDescriptions.requireAuth;
  }

  let noteFieldCaption: string = ' ';
  $: if (fieldDescriptions && !$photosAppConfig.loading && noteFieldCaption === ' ') {
    noteFieldCaption = fieldDescriptions.note;
  }

  type AA = typeof actionAccess.modify.users;

  let getUsers: AA = [' '];
  $: if (actionAccess && !$photosAppConfig.loading && getUsers[0] === ' ') {
    getUsers = actionAccess.get.users;
  }
  let getTeams: AA = [' '];
  $: if (actionAccess && !$photosAppConfig.loading && getTeams[0] === ' ') {
    getTeams = actionAccess.get.teams;
  }

  let modifyUsers: AA = [' '];
  $: if (actionAccess && !$photosAppConfig.loading && modifyUsers[0] === ' ') {
    modifyUsers = actionAccess.modify.users;
  }
  let modifyTeams: AA = [' '];
  $: if (actionAccess && !$photosAppConfig.loading && modifyTeams[0] === ' ') {
    modifyTeams = actionAccess.modify.teams;
  }

  let createUsers: AA = [' '];
  $: if (actionAccess && !$photosAppConfig.loading && createUsers[0] === ' ') {
    createUsers = actionAccess.create.users;
  }
  let createTeams: AA = [' '];
  $: if (actionAccess && !$photosAppConfig.loading && createTeams[0] === ' ') {
    createTeams = actionAccess.create.teams;
  }

  let hideUsers: AA = [' '];
  $: if (actionAccess?.hide && !$photosAppConfig.loading && hideUsers[0] === ' ') {
    hideUsers = actionAccess.hide.users;
  }
  let hideTeams: AA = [' '];
  $: if (actionAccess?.hide && !$photosAppConfig.loading && hideTeams[0] === ' ') {
    hideTeams = actionAccess.hide.teams;
  }

  onMount(() => {
    document.title = 'Configure photos app';
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
      .savePhotosAppConfigChanges({
        fieldDescriptions: {
          name: nameFieldCaption,
          source: sourceFieldCaption,
          tags: tagsFieldCaption,
          requireAuth: requireAuthFieldCaption,
          note: noteFieldCaption,
        },
        actionAccess: {
          get: { users: cleanArray(getUsers), teams: cleanArray(getTeams) },
          create: { users: cleanArray(createUsers), teams: cleanArray(createTeams) },
          modify: { users: cleanArray(modifyUsers), teams: cleanArray(modifyTeams) },
          hide: { users: stringifyArray(hideUsers), teams: cleanArray(hideTeams) },
        },
      })
      .finally(() => {
        saving = false;
        $photosAppConfig.refetch();
        $appFieldDescriptions.refetch();
      });
  }
</script>

<PageTitle>Configure photos app</PageTitle>

<ActionRow>
  {#if true}
    <Button
      variant="accent"
      style="width: 174px;"
      on:click={saveChanges}
      disabled={$photosAppConfig.loading || saving}
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
        sourceFieldCaption = ' ';
        tagsFieldCaption = ' ';
        requireAuthFieldCaption = ' ';
        noteFieldCaption = ' ';

        getUsers = [' '];
        getTeams = [' '];
        createUsers = [' '];
        createTeams = [' '];
        modifyUsers = [' '];
        modifyTeams = [' '];
        hideUsers = [' '];
        hideTeams = [' '];

        $photosAppConfig.refetch();
      }}
      disabled={$photosAppConfig.loading || saving}
    >
      {#if $photosAppConfig.loading}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        <FluentIcon name="ArrowClockwise16Regular" mode="buttonIconLeft" />
        Discard changes
      {/if}
    </Button>
  {/if}
</ActionRow>

<PageSubtitle caption="Choose the descriptions (help text) that appear under each field in the photo editor">
  Custom field descriptions
</PageSubtitle>

<section>
  <FieldWrapper label="Name" forId="custom-description-name">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-name" bind:value={nameFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $photosAppConfig.loading ||
          nameFieldCaption === defaultFieldDescriptions.name}
        on:click={() => {
          if (defaultFieldDescriptions) nameFieldCaption = defaultFieldDescriptions.name;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Source" forId="custom-description-source">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-source" bind:value={sourceFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $photosAppConfig.loading ||
          sourceFieldCaption === defaultFieldDescriptions.source}
        on:click={() => {
          if (defaultFieldDescriptions) sourceFieldCaption = defaultFieldDescriptions.source;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Tags" forId="custom-description-tags">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-tags" bind:value={tagsFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $photosAppConfig.loading ||
          tagsFieldCaption === defaultFieldDescriptions.tags}
        on:click={() => {
          if (defaultFieldDescriptions) tagsFieldCaption = defaultFieldDescriptions.tags;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Require authentication" forId="custom-description-requireAuth">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-requireAuth" bind:value={requireAuthFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $photosAppConfig.loading ||
          requireAuthFieldCaption === defaultFieldDescriptions.requireAuth}
        on:click={() => {
          if (defaultFieldDescriptions) requireAuthFieldCaption = defaultFieldDescriptions.requireAuth;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Note" forId="custom-description-note">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-note" bind:value={noteFieldCaption} />
      <Button
        disabled={!defaultFieldDescriptions ||
          $photosAppConfig.loading ||
          noteFieldCaption === defaultFieldDescriptions.note}
        on:click={() => {
          if (defaultFieldDescriptions) noteFieldCaption = defaultFieldDescriptions.note;
        }}
      >
        Restore default
      </Button>
    </div>
  </FieldWrapper>
</section>

<PageSubtitle caption="Choose which users and teams can add, remove, edit, and hide photos.">
  Permissions
</PageSubtitle>

<section>
  <div class="action-grid">
    <ActionAccessCard bind:users={getUsers} bind:teams={getTeams}>View photos</ActionAccessCard>
    <ActionAccessCard bind:users={createUsers} bind:teams={createTeams}>Create photos</ActionAccessCard>
    <ActionAccessCard bind:users={modifyUsers} bind:teams={modifyTeams}>Modify photos</ActionAccessCard>
    <ActionAccessCard bind:users={hideUsers} bind:teams={hideTeams}>Hide (delete) photos</ActionAccessCard>
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
