<script lang="ts">
  import {
    CreateUser,
    type CreateUserMutation,
    type CreateUserMutationVariables,
    type FieldDescriptionsQuery,
  } from '$graphql/graphql';
  import { FieldWrapper } from '$lib/common/Field';
  import { server } from '$utils/constants';
  import { notEmpty, slugify } from '@jackbuehner/cristata-utils';
  import dompurify from 'dompurify';
  import { Button, Checkbox, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';
  import type { LayoutDataType } from '../../routes/(standard)/[tenant]/+layout';

  type ProfileAppConfig = NonNullable<
    NonNullable<NonNullable<FieldDescriptionsQuery['configuration']>['apps']>['profiles']
  >;
  type FieldDescriptions = Omit<ProfileAppConfig['fieldDescriptions'], '__typename'>;

  export let open = false;

  export let tenant: string;
  export let fieldDescriptions: FieldDescriptions | undefined = undefined;
  export let basicProfiles: LayoutDataType['basicProfiles'];

  let name: string;
  let email: string;
  let phone: string;
  let current_title: string;
  let retired: boolean;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((invitedUserId: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let loadingSubmit = false;
  let loadingCancel = false;

  // update username when name changes
  $: username = (() => {
    let proposedUsername = slugify(name || '', '.');

    // check if the username already exists
    const usernameAlreadyExists = (proposedUsername: string) => {
      return !!$basicProfiles.data?.users?.docs
        .filter(notEmpty)
        .map((user) => user.u)
        .find((u) => u === proposedUsername);
    };

    const generateUniqueUsername = (_proposedUsername: string) => {
      let proposedUsername = _proposedUsername;

      // if the username already exists, put a new number at the end
      const incrementUsername = () => {
        const numberStrAtEnd = proposedUsername.match(/\d+$/)?.[0];
        const numberAtEnd = numberStrAtEnd ? parseInt(numberStrAtEnd) : undefined;

        // if there is already a number, increment it
        if (numberAtEnd) {
          proposedUsername = proposedUsername.replace(`${numberAtEnd}`, `${numberAtEnd + 1}`);
        } else {
          proposedUsername += '1';
        }

        // check again
        if (usernameAlreadyExists(proposedUsername)) incrementUsername();
      };

      if (usernameAlreadyExists(proposedUsername)) {
        incrementUsername();
      }

      return proposedUsername;
    };

    return generateUniqueUsername(proposedUsername);
  })();

  // update slug based on username
  $: slug = username.replaceAll('.', '-');

  // check if email already exists
  $: emailAlreadyExists = !!$basicProfiles.data?.users?.docs
    .filter(notEmpty)
    .map((user) => user.e)
    .find((e) => e === email);

  async function saveChanges(): Promise<string | false | undefined> {
    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CreateUser),
        variables: {
          name,
          username,
          slug,
          email,
          current_title,
          phone: parseInt(phone),
          retired,
        } satisfies CreateUserMutationVariables,
      }),
    })
      .then(async (res): Promise<string | false | undefined> => {
        if (res.ok) {
          const json = (await res.json()) as { data: CreateUserMutation; errors: any };
          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          } else {
            return json.data.userCreate?._id as string | undefined;
          }
        }
        error = `${res.status} ${res.statusText}`;
        return false;
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });

    return res as string | false | undefined;
  }
</script>

<ContentDialog
  title="Invite new user"
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
    <FieldWrapper label="Name" forId="name">
      <svelte:fragment slot="caption">
        {#if fieldDescriptions}
          {@html dompurify.sanitize(fieldDescriptions.name)}
          <br />
          <br />
          <div>
            <strong>Username:</strong>
            {username || '_'}
          </div>
          <div>
            <strong>Slug:</strong>
            {slug || '_'}
          </div>
        {/if}
      </svelte:fragment>
      <TextBox type="text" bind:value={name} />
    </FieldWrapper>
  </div>

  <div class="field">
    <FieldWrapper label="Email address" forId="email">
      <svelte:fragment slot="caption">
        {#if fieldDescriptions}
          {@html dompurify.sanitize(fieldDescriptions.email)}
        {/if}
      </svelte:fragment>
      <TextBox type="email" bind:value={email} />
      {#if emailAlreadyExists}
        <InfoBar
          severity="critical"
          title="This email address is already in use."
          style="margin-top: 10px;"
          closable={false}
        >
          <p>Instead of creating this person a new account, reactivate their old account.</p>

          <p>
            Deactivated accounts can be reactivated in the profiles app. Click <b>Toolbox</b> and uncheck
            <b>Hide inactive users</b>. Navigate to the profile, click <b>Edit profile</b>, and the uncheck the
            <b>Deactive this user</b> field.
          </p>

          <p>
            If you need to resend an invite, you can resend the invite from the person's profile in the profiles
            app. Navigate to the profile and click <b>Resend invite</b>.
          </p>
        </InfoBar>
      {/if}
    </FieldWrapper>
  </div>

  <div class="field">
    <FieldWrapper label="Phone" forId="phone">
      <svelte:fragment slot="caption">
        {#if fieldDescriptions}
          {@html dompurify.sanitize(fieldDescriptions.phone)}
        {/if}
      </svelte:fragment>
      <TextBox type="tel" bind:value={phone} />
    </FieldWrapper>
  </div>

  <div class="field">
    <FieldWrapper label="Title" forId="current_title">
      <svelte:fragment slot="caption">
        {#if fieldDescriptions}
          {@html dompurify.sanitize(fieldDescriptions.title)}
        {/if}
      </svelte:fragment>
      <TextBox type="text" bind:value={current_title} />
    </FieldWrapper>
  </div>

  <div class="field">
    <TextBlock>Deactivation</TextBlock>
    <TextBlock variant="caption">Deactivated users cannot sign in to Cristata.</TextBlock>
    <Checkbox bind:checked={retired}>Deactivate this user upon invite</Checkbox>
  </div>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={!!emailAlreadyExists || !email || !name || !current_title || !username || !slug}
      on:click={async () => {
        loadingSubmit = true;
        const success = await saveChanges();
        if (success) {
          await handleAction?.();
          await handleSumbit?.(success);
          open = false;

          // refetch the list of profiles in the background after this account/user/profile is created
          $basicProfiles.refetch();
        }
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Save changes
      {/if}
    </Button>
    <Button
      on:click={async () => {
        name = '';
        email = '';
        phone = '';
        current_title = '';
        retired = false;

        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;

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
