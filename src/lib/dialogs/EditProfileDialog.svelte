<script lang="ts">
  import { SaveUserDeactivate, SaveUserEdits } from '$graphql/graphql';
  import { server } from '$utils/constants';
  import { Button, Checkbox, ContentDialog, InfoBar, ProgressRing, TextBlock, TextBox } from 'fluent-svelte';
  import { print } from 'graphql';

  export let open = false;
  export let canManage = false;

  export let tenant: string;

  export let _id: string;
  export let name: string;
  export let email: string | undefined;
  export let phone: string | undefined;
  export let twitter: string | undefined;
  export let biography: string | undefined;
  export let current_title: string | undefined;
  export let retired: boolean;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let hasRetiredChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function saveChanges(): Promise<boolean> {
    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(SaveUserEdits),
        variables: {
          _id,
          input: {
            name: name ?? undefined,
            email: email ?? undefined,
            phone: parseInt(phone || '') ?? undefined,
            twitter: twitter ?? undefined,
            biography: biography ?? undefined,
            current_title: current_title ?? undefined,
          },
        },
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          } else {
            return true;
          }
        }
        error = `${res.status} ${res.statusText}`;
        return false;
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });

    if (hasRetiredChanged) {
      await fetch(`${server.location}/v3/${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: print(SaveUserDeactivate),
          variables: { _id, retired },
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            if (json.errors) {
              error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
              return false;
            } else {
              return true;
            }
          }
          error = `${res.status} ${res.statusText}`;
          return false;
        })
        .catch((err) => {
          error = err.message || JSON.stringify(err || 'Unknown error');
          return false;
        });
    }

    return res;
  }
</script>

<ContentDialog
  title="Edit profile"
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
    <TextBlock>Name</TextBlock>
    <TextBlock variant="caption">The name of this user. This does not change the username or slug.</TextBlock>
    <TextBox type="text" bind:value={name} on:change={() => (hasChanged = true)} />
  </div>

  <div class="field">
    <TextBlock>Email address</TextBlock>
    <TextBlock variant="caption">The user's email. Try to only use your organizaion's email domain.</TextBlock>
    <TextBox type="email" bind:value={email} on:change={() => (hasChanged = true)} />
  </div>

  <div class="field">
    <TextBlock>Phone</TextBlock>
    <TextBlock variant="caption">
      Add your number so coworkers can contact you about your work. It is only available to users with Cristata
      accounts.
    </TextBlock>
    <TextBox type="tel" bind:value={phone} on:change={() => (hasChanged = true)} />
  </div>

  <div class="field">
    <TextBlock>Twitter</TextBlock>
    <TextBlock variant="caption">Let everyone know where to follow you.</TextBlock>
    <TextBox type="text" bind:value={twitter} on:change={() => (hasChanged = true)} />
  </div>

  <div class="field">
    <TextBlock>Biography</TextBlock>
    <TextBlock variant="caption">
      A short biography highlighting accomplishments and qualifications. It should be in paragraph form and
      written in the third person.
    </TextBlock>
    <TextBox type="text" bind:value={biography} on:change={() => (hasChanged = true)} />
  </div>

  {#if canManage}
    <div class="field">
      <TextBlock>Title</TextBlock>
      <TextBlock variant="caption">The position or job title for the user.</TextBlock>
      <TextBox bind:value={current_title} on:change={() => (hasChanged = true)} />
    </div>
    <div class="field">
      <TextBlock>Deactivation</TextBlock>
      <TextBlock variant="caption">Deactivated users cannot sign in to Cristata.</TextBlock>
      <Checkbox
        bind:checked={retired}
        on:change={() => {
          hasChanged = true;
          hasRetiredChanged = true;
        }}>Deactivate this user</Checkbox
      >
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        loadingSubmit = true;
        const success = await saveChanges();
        loadingSubmit = false;
        if (success) {
          await handleAction?.();
          await handleSumbit?.();
          // await invalidate((url) => url.pathname === $page.url.pathname);
          // invalidateQueryCache('Profile', { _id }, $page.url);
          open = false;
        }
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
        if (hasChanged || hasRetiredChanged) {
          loadingCancel = true;
          await handleAction?.();
          await handleCancel?.();
          loadingCancel = false;
        }
        open = false;
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Discard changes
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
