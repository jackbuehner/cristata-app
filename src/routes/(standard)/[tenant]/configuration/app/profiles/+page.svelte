<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import { Button, ProgressRing, TextBox } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ profilesAppConfig } = data);

  $: defaultFieldDescriptions = $profilesAppConfig.data?.configuration?.apps.profiles.defaultFieldDescriptions;
  $: fieldDescriptions = $profilesAppConfig.data?.configuration?.apps.profiles.fieldDescriptions;

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
</script>

<PageTitle>Configure profiles app</PageTitle>

<ActionRow>
  {#if true}
    <Button variant="accent">
      <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
      Save configuration
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
        $profilesAppConfig.refetch();
      }}
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
  caption="Choose which users and teams can add, remove, and edit users. Users can always edit their own name, email, phone, twitter, and biography."
>
  Permissions
</PageSubtitle>

<section>
  <Button variant="standard" href="{data.authUser.tenant}/configuration/system-collection/User/action-access">
    <FluentIcon name="Edit16Regular" mode="buttonIconLeft" />
    Edit in the system collection editor
  </Button>
</section>

<style>
  section {
    margin: 0 auto;
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
</style>
