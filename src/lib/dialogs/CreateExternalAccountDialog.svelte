<script lang="ts">
  import { CreateExternalAccount } from '$graphql/graphql';
  import { FieldWrapper } from '$lib/common/Field';
  import { server } from '$utils/constants';
  import { Button, ContentDialog, InfoBar, ProgressRing, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;

  export let tenant: string;

  let name = '';
  let website = '';
  let username = '';
  let password = '';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((_id: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function saveChanges(): Promise<false | string> {
    return await fetch(`${server.location}/v3/${tenant}?CreateExternalAccount`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(CreateExternalAccount),
        variables: {
          name: name || undefined,
          website: website || undefined,
          username: username || undefined,
          password: password || undefined,
        },
      }),
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');

        if (contentType && contentType.indexOf('application/json') !== -1) {
          const json = await res.json();

          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          }

          if (res.ok) {
            return json.data?.externalAccountCreate?._id || true;
          }

          error = `${res.status} ${res.statusText}`;
          return false;
        }
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });
  }
</script>

<ContentDialog
  title="Create external account record"
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

  <FieldWrapper
    label="Account name"
    forId="name"
    description="This name will be displayed above the account credentials. Use a name that will allow you to remember where to use these credentials."
  >
    <TextBox bind:value={name} id="name" />
  </FieldWrapper>

  <FieldWrapper
    label="Website"
    forId="website"
    description="Enter the website URL for where these credetials should be used."
  >
    <TextBox bind:value={website} id="website" />
  </FieldWrapper>

  <FieldWrapper
    label="Username"
    forId="username"
    description="Enter the username or email address that is used for this account."
  >
    <TextBox bind:value={username} id="username" />
  </FieldWrapper>

  <FieldWrapper
    label="Password"
    forId="password"
    description="Enter the password for this account. The password will be encrypted in the database and decrypted when you load the <b>external accounts</b> app."
  >
    <TextBox bind:value={password} id="password" type="password" autocomplete="new-password" />
  </FieldWrapper>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        loadingSubmit = true;
        const success = await saveChanges();
        if (success) {
          await handleAction?.();
          await handleSumbit?.(success);
          open = false;
          name = '';
          website = '';
          username = '';
          password = '';
        }
        loadingSubmit = false;
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Create record
      {/if}
    </Button>
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
        open = false;
        name = '';
        website = '';
        username = '';
        password = '';
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
