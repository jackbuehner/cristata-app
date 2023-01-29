<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { VITE_AUTH_BASE_URL } from '$env/static/public';
  import { ResendInvite } from '$graphql/graphql';
  import { Chip } from '$lib/common/Chip';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import EditProfileDialog from '$lib/dialogs/EditProfileDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { getPasswordStatus } from '$utils/axios/getPasswordStatus';
  import { server } from '$utils/constants';
  import { formatISODate } from '$utils/formatISODate';
  import { notEmpty } from '$utils/notEmpty';
  import { Button, Expander, InfoBar, PersonPicture, ProgressRing, TextBlock } from 'fluent-svelte';
  import { print } from 'graphql';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ profile: _profile } = data);
  $: profile = $_profile.data?.user;
  $: teams = (profile?.teams?.docs || []).filter(notEmpty).sort((a, b) => a.name.localeCompare(b.name));
  $: isSelf = profile?._id === data.authUser._id.toHexString();
  $: ({ temporary, expired, expiresAt } = getPasswordStatus((profile?.flags || []).filter(notEmpty)));
  $: canEdit = $_profile.data?.userActionAccess?.modify || isSelf;
  $: canManage = $_profile.data?.userActionAccess?.modify && $_profile.data?.userActionAccess?.deactivate;

  let editDialogOpen = false;

  $: {
    if (browser) {
      document.title = `${profile?.name ? profile.name + ' - ' : ''} Profile - Cristata`;
    }
  }

  let resendInviteError: string = '';
  let resendInviteLoading = false;
  async function resendInvite(): Promise<boolean> {
    if (!profile) return false;

    return await fetch(`${server.location}/v3/${$page.params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(ResendInvite),
        variables: {
          _id: profile._id,
        },
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          if (json.errors) {
            resendInviteError =
              json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          } else {
            return true;
          }
        }
        resendInviteError = `${res.status} ${res.statusText}`;
        return false;
      })
      .catch((err) => {
        resendInviteError = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });
  }
</script>

{#if profile}
  <article>
    <div class="title-box">
      <PersonPicture src={profile.photo || ''} alt={profile.name} size={80} />
      <div class="title-box-text">
        <TextBlock variant="title">{profile.name}</TextBlock>
        <TextBlock variant="bodyStrong">{profile.current_title}</TextBlock>
      </div>
    </div>

    <div class="button-row">
      {#if canEdit}
        <Button variant="accent" on:click={() => (editDialogOpen = true)}>
          <FluentIcon name="Edit16Regular" mode="buttonIconLeft" />
          Edit profile
        </Button>
      {/if}
      {#if isSelf}
        <Button
          href="{$page.url.protocol}//{VITE_AUTH_BASE_URL}/{$page.params
            .tenant}/change-password?return={encodeURIComponent($page.url.href)}"
        >
          <FluentIcon name="Key16Regular" mode="buttonIconLeft" />
          Change password
        </Button>
      {/if}
      {#if canManage && (temporary || expired)}
        <Button
          style="width: 158px"
          on:click={async () => {
            resendInviteLoading = true;
            await resendInvite();
            await $_profile.refetch();
            resendInviteLoading = false;
          }}
        >
          {#if resendInviteLoading}
            <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
          {:else}
            <FluentIcon name="Send16Regular" mode="buttonIconLeft" />
            Resend invitation
          {/if}
        </Button>
      {/if}
    </div>

    {#if profile.retired}
      <InfoBar severity="attention" closable={false} title="This account is deactivated.">
        {profile.name} will not be able to sign in to Cristata.
      </InfoBar>
    {/if}

    {#if expired}
      <InfoBar severity="critical" closable={false} title="Invitation expired">
        {profile.name} never accepted their invitation. They will not be able to sign in to Cristata.
        {#if expiresAt}
          It expired on {formatISODate(expiresAt.toISOString(), true, true, true)}
        {/if}
      </InfoBar>
    {/if}

    {#if temporary}
      <InfoBar severity="caution" closable={false} title="Invitation pending">
        {profile.name} has not accepted their invitation to Cristata.
        {#if expiresAt}
          It will expire on {formatISODate(expiresAt.toISOString(), true, true, true)}
        {/if}
      </InfoBar>
    {/if}

    {#if resendInviteError}
      <InfoBar severity="critical" closable={false} title="Failed to resend invite">
        {resendInviteError}
      </InfoBar>
    {/if}

    <h2>
      <FluentIcon name="Person16Regular" mode="bodyStrongLeft" />
      <TextBlock variant="bodyStrong">Contact information</TextBlock>
    </h2>

    <section class:compact={$compactMode} class="grid">
      <TextBlock>Phone</TextBlock><TextBlock>{profile.phone || ''}</TextBlock>
      <TextBlock>Email</TextBlock><TextBlock>{profile.email || ''}</TextBlock>
      <TextBlock>Twitter</TextBlock><TextBlock>{profile.twitter ? '@' : ''}{profile.twitter || ''}</TextBlock>
    </section>

    <h2>
      <FluentIcon name="Briefcase16Regular" mode="bodyStrongLeft" />
      <TextBlock variant="bodyStrong">Work information</TextBlock>
    </h2>

    <section class:compact={$compactMode} class="grid">
      <TextBlock>Biography</TextBlock><TextBlock>{profile.biography || ''}</TextBlock>
      <TextBlock>Current title</TextBlock><TextBlock>{profile.current_title || ''}</TextBlock>
      <TextBlock>Join date</TextBlock>
      <TextBlock>
        {#if profile.timestamps?.created_at}
          {formatISODate(profile.timestamps.created_at)}
        {/if}
      </TextBlock>
    </section>

    <h2>
      <FluentIcon name="PersonAccounts20Regular" mode="bodyStrongLeft" />
      <TextBlock variant="bodyStrong">Account information</TextBlock>
    </h2>

    <section class:compact={$compactMode} class="grid">
      <TextBlock>Username</TextBlock><TextBlock>{profile.username}</TextBlock>
      <TextBlock>Slug</TextBlock><TextBlock>{profile.slug}</TextBlock>
    </section>

    <h2>
      <FluentIcon name="PersonAccounts20Regular" mode="bodyStrongLeft" />
      <TextBlock variant="bodyStrong">Teams and groups</TextBlock>
    </h2>

    <section class:compact={$compactMode} class="chips">
      {#if teams.length > 0}
        {#each teams as team}
          <Chip compact={$compactMode} href="/{data.authUser.tenant}/teams/{team._id}">{team.name}</Chip>
        {/each}
      {:else}
        <TextBlock>{profile.name} is not a member or organizer of any teams or groups.</TextBlock>
      {/if}
    </section>

    <h2 class="big">
      <TextBlock variant="subtitle">Advanced</TextBlock>
    </h2>

    <Expander>
      <FluentIcon name="Wrench16Regular" slot="icon" />
      Advanced details
      <svelte:fragment slot="content">
        <section class:compact={$compactMode} class="grid">
          {#if profile.timestamps?.modified_at && profile.people?.last_modified_by}
            <TextBlock>Last edited at</TextBlock>
            <TextBlock>
              {formatISODate(profile.timestamps.modified_at, false, true, true)}
              by
              {profile.people.last_modified_by.name}
            </TextBlock>
          {/if}
          {#if profile.timestamps?.created_at && profile.people?.created_by}
            <TextBlock>Created at</TextBlock>
            <TextBlock>
              {formatISODate(profile.timestamps.created_at, false, true, true)}
              by
              {profile.people.created_by.name}
            </TextBlock>
          {/if}
          {#if profile.timestamps?.last_login_at}
            <TextBlock>Last login at</TextBlock>
            <TextBlock>
              {formatISODate(profile.timestamps.last_login_at, false, true, true)}
            </TextBlock>
          {/if}
          {#if profile.timestamps?.last_active_at}
            <TextBlock>Last active at</TextBlock>
            <TextBlock>
              {formatISODate(profile.timestamps.last_active_at, false, true, true)}
            </TextBlock>
          {/if}
          {#if profile.retired !== null}
            <TextBlock>Account disabled</TextBlock>
            <TextBlock>
              {#if profile.retired}
                Yes
              {:else}
                No
              {/if}
            </TextBlock>
          {/if}
          {#if profile.hidden !== null}
            <TextBlock>Account hidden</TextBlock>
            <TextBlock>
              {#if profile.hidden}
                Yes
              {:else}
                No
              {/if}
            </TextBlock>
          {/if}
          {#if profile.locked !== null}
            <TextBlock>Account locked</TextBlock>
            <TextBlock>
              {#if profile.locked}
                Yes
              {:else}
                No
              {/if}
            </TextBlock>
          {/if}
          {#if profile.archived !== null}
            <TextBlock>Account archived</TextBlock>
            <TextBlock>
              {#if profile.archived}
                Yes
              {:else}
                No
              {/if}
            </TextBlock>
          {/if}
          {#if profile.methods}
            <TextBlock>Login methods</TextBlock>
            <TextBlock>
              {profile.methods.filter(notEmpty).join(', ')}
            </TextBlock>
          {/if}
        </section>
      </svelte:fragment>
    </Expander>

    <EditProfileDialog
      bind:open={editDialogOpen}
      tenant={data.authUser.tenant}
      canManage={canManage || false}
      _id={profile._id}
      name={profile.name}
      email={profile.email || undefined}
      phone={`${profile.phone || ''}` || undefined}
      twitter={profile.twitter || undefined}
      biography={profile.biography || undefined}
      current_title={profile.current_title || undefined}
      retired={profile.retired || false}
      handleSumbit={() => $_profile.refetch()}
      handleCancel={() => $_profile.refetch()}
    />
  </article>
{/if}

<style>
  article {
    margin: 32px auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  h2 {
    margin: 24px 0 10px 0;
  }

  h2.big {
    padding-top: 26px;
  }

  section.grid {
    display: grid;
    grid-template-columns: 140px 1fr;
  }

  section.grid :global(.type-body) {
    margin: 6px 0;
  }

  section.grid.compact {
    grid-template-columns: 130px 1fr;
  }

  section.grid.compact :global(.type-body) {
    margin: 2px 0;
  }

  section.chips {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
  }

  section.chips.compact {
    gap: 3px;
  }

  .button-row {
    margin: 20px 0;
    display: flex;
    gap: 10px;
  }

  .title-box {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
  }

  .title-box-text {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }
</style>
