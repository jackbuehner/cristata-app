<script lang="ts">
  import { goto } from '$app/navigation';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import { ActionRow, PageSubtitle, PageTitle } from '$lib/common/PageTitle';
  import CreateTeamDialog from '$lib/dialogs/CreateTeamDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { genAvatar } from '$utils/genAvatar';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, InfoBar, TextBlock, TextBox } from 'fluent-svelte';
  import type { PageData } from './$types';
  import { FieldWrapper } from '$lib/common/Field';

  export let data: PageData;

  const nameFieldCaptionDefault = 'The name of this user. This does not change the username or slug.';
  const emailFieldCaptionDefault = "The user's email. Try to only use your organization's email domain.";
  const phoneFieldCaptionDefault =
    'Add your number so coworkers can contact you about your work. It is only available to users with Cristata accounts.';
  const twitterFieldCaptionDefault = 'Let everyone know where to follow you.';
  const bioFieldCaptionDefault =
    'A short biography highlighting accomplishments and qualifications. It should be in paragraph form and written in the third person.';
  const titleFieldCaptionDefault = 'The position or job title for the user.';

  let nameFieldCaption = 'The name of this user. This does not change the username or slug.';
  let emailFieldCaption = "The user's email. Try to only use your organization's email domain.";
  let phoneFieldCaption =
    'Add your number so coworkers can contact you about your work. It is only available to users with Cristata accounts.';
  let twitterFieldCaption = 'Let everyone know where to follow you.';
  let bioFieldCaption =
    'A short biography highlighting accomplishments and qualifications. It should be in paragraph form and written in the third person.';
  let titleFieldCaption = 'The position or job title for the user.';
</script>

<PageTitle>Configure profiles app</PageTitle>

<ActionRow>
  {#if true}
    <Button variant="accent">
      <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
      Save configuration
    </Button>
    <Button>
      <FluentIcon name="ArrowReset16Regular" mode="buttonIconLeft" />
      Discard changes
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
      <Button on:click={() => (nameFieldCaption = nameFieldCaptionDefault)}>Restore default</Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Email address" forId="custom-description-email">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-email" bind:value={emailFieldCaption} />
      <Button on:click={() => (emailFieldCaption = emailFieldCaptionDefault)}>Restore default</Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Phone" forId="custom-description-phone">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-phone" bind:value={phoneFieldCaption} />
      <Button on:click={() => (phoneFieldCaption = phoneFieldCaptionDefault)}>Restore default</Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Twitter" forId="custom-description-twitter">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-twitter" bind:value={twitterFieldCaption} />
      <Button on:click={() => (twitterFieldCaption = twitterFieldCaptionDefault)}>Restore default</Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Biography" forId="custom-description-biography">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-biography" bind:value={bioFieldCaption} />
      <Button on:click={() => (bioFieldCaption = bioFieldCaptionDefault)}>Restore default</Button>
    </div>
  </FieldWrapper>

  <FieldWrapper label="Title" forId="custom-description-title">
    <div class="custom-description-field">
      <TextBox type="text" id="custom-description-title" bind:value={titleFieldCaption} />
      <Button on:click={() => (titleFieldCaption = titleFieldCaptionDefault)}>Restore default</Button>
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
