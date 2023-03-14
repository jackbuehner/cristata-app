<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { RemoveUserFromTeam, type TeamQuery } from '$graphql/graphql';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import RemoveFromTeamDialog from '$lib/dialogs/RemoveFromTeamDialog.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { server } from '$utils/constants';
  import { genAvatar } from '$utils/genAvatar';
  import { notEmpty } from '$utils/notEmpty';
  import { getPasswordStatus } from '@jackbuehner/cristata-utils';
  import { Button, MenuFlyout, MenuFlyoutDivider, MenuFlyoutItem, TextBlock } from 'fluent-svelte';
  import { print } from 'graphql';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  export let open = false;
  export let person: NonNullable<NonNullable<NonNullable<TeamQuery['team']>['members']>[0]>;
  export let team: NonNullable<TeamQuery['team']> | undefined = undefined;
  export let canDeactivate = false;
  export let flyIn = false;

  export let loading = false;
  export let beforeSaveChange: (() => Promise<void>) | undefined = undefined;
  export let afterSaveChange: (() => Promise<void>) | undefined = undefined;

  let removeFromTeamDialogOpen = false;

  const isCurrentlyAMember = !!team?.members.filter(notEmpty).find((member) => member._id === person._id);
  const isCurrentlyAnOrganizer = !!team?.organizers
    .filter(notEmpty)
    .find((organizer) => organizer._id === person._id);

  const { temporary, expired } = getPasswordStatus(person.flags.filter(notEmpty));

  async function setRole(_id: string, role: 'member' | 'organizer', currentRole: 'member' | 'organizer') {
    if (
      team &&
      ((role === 'member' && currentRole !== 'member') || (role === 'organizer' && currentRole !== 'organizer'))
    ) {
      loading = true;
      beforeSaveChange?.();
      return await fetch(`${server.location}/v3/${$page.params.tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: print(RemoveUserFromTeam),
          variables: {
            _id: team._id,
            input: {
              organizers: (() => {
                if (role === 'member' && currentRole !== 'member') {
                  return team.organizers
                    .filter(notEmpty)
                    .map((user) => user._id)
                    .filter((user) => user !== person._id);
                }
                return Array.from(
                  new Set([...(team.organizers || []).filter(notEmpty).map((user) => user._id), _id])
                );
              })(),
              members: (() => {
                if (role === 'member' && currentRole !== 'member') {
                  return Array.from(
                    new Set([...(team.members || []).filter(notEmpty).map((user) => user._id), _id])
                  );
                }
                return team.members
                  .filter(notEmpty)
                  .map((user) => user._id)
                  .filter((user) => user !== person._id);
              })(),
            },
          },
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            if (json.errors) {
              return false;
            } else {
              return true;
            }
          }
          return false;
        })
        .catch((err) => {
          return false;
        })
        .finally(() => {
          afterSaveChange?.();
          loading = false;
        });
    }

    return false;
  }
</script>

<div
  class="person-card"
  in:fly={{ y: flyIn ? 40 : 0, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
>
  <Button
    on:click={() => {
      open = !open;
    }}
  >
    <div style="margin-top: {$compactMode ? 20 : 40}px;">
      <MenuFlyout bind:open class="person-menu" placement="right" alignment="start" offset={0}>
        <svelte:fragment slot="flyout">
          <MenuFlyoutItem
            on:click={() => {
              const url = new URL(`/${$page.params.tenant}/profile/${person._id}`, $page.url.origin);
              if (person.name) url.searchParams.set('name', person.name);
              if (person.current_title) url.searchParams.set('current_title', person.current_title);
              goto(url);
            }}
          >
            <svelte:fragment slot="icon">
              <FluentIcon name="Person20Regular" />
            </svelte:fragment>
            View profile
          </MenuFlyoutItem>
          {#if person.email}
            <MenuFlyoutDivider />
            <MenuFlyoutItem indented on:click={() => window.open(`mailto:${person.email}`)}>
              Send email
            </MenuFlyoutItem>
          {/if}
          {#if canDeactivate && !!team}
            <MenuFlyoutDivider />
            <MenuFlyoutItem indented cascading>
              Change role
              <svelte:fragment slot="flyout">
                <MenuFlyoutItem
                  indented={!isCurrentlyAMember}
                  disabled={loading}
                  on:click={() => {
                    setRole(person._id, 'member', isCurrentlyAMember ? 'member' : 'organizer');
                  }}
                >
                  <svelte:fragment slot="icon">
                    {#if isCurrentlyAMember}
                      <FluentIcon name="Checkmark20Regular" />
                    {/if}
                  </svelte:fragment>
                  Member
                </MenuFlyoutItem>
                <MenuFlyoutItem
                  indented={!isCurrentlyAnOrganizer}
                  disabled={loading}
                  on:click={() => {
                    setRole(person._id, 'organizer', isCurrentlyAMember ? 'member' : 'organizer');
                  }}
                >
                  <svelte:fragment slot="icon">
                    {#if isCurrentlyAnOrganizer}
                      <FluentIcon name="Checkmark20Regular" />
                    {/if}
                  </svelte:fragment>
                  Organizer
                </MenuFlyoutItem>
              </svelte:fragment>
            </MenuFlyoutItem>
            <MenuFlyoutItem
              indented
              disabled={loading}
              on:click={() => {
                removeFromTeamDialogOpen = true;
              }}
            >
              Remove from team
            </MenuFlyoutItem>
          {/if}
        </svelte:fragment>
      </MenuFlyout>
    </div>
    <article class:compact={$compactMode}>
      <img src={person.photo || genAvatar(person._id, 36, 'beam')} alt="" class="team-photo" />
      <div class="person-meta" class:compact={$compactMode}>
        <TextBlock>{person.name}</TextBlock>

        {#if !$compactMode}
          <TextBlock>{person.current_title || 'Employee'}</TextBlock>
        {/if}

        {#if person.retired}
          <TextBlock><i class="danger">Account deactivated</i></TextBlock>
        {:else if expired}
          <TextBlock><i class="danger">Invitation expired</i></TextBlock>
        {:else if temporary}
          <TextBlock><i class="danger">Pending invitation acceptance</i></TextBlock>
        {:else if $compactMode}
          <TextBlock>{person.current_title || 'Employee'}</TextBlock>
        {:else}
          <TextBlock>{person.email || person._id.slice(-6)}</TextBlock>
        {/if}
      </div>
      <FluentIcon name="MoreHorizontal16Regular" />
    </article>
  </Button>

  {#if team}
    <RemoveFromTeamDialog
      bind:open={removeFromTeamDialogOpen}
      name={person.name}
      user_id={person._id}
      team_id={team._id}
      members={team.members.filter(notEmpty).map(({ _id }) => _id)}
      organizers={team.organizers.filter(notEmpty).map(({ _id }) => _id)}
      tenant={$page.params.tenant}
      retired={person.retired || false}
      canManage={canDeactivate}
      handleSumbit={async () => {
        await afterSaveChange?.();
        loading = false;
      }}
    />
  {/if}
</div>

<style>
  article {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 4px;
    color: var(--fds-text-primary);
    width: 100%;
    overflow: hidden;
  }

  article.compact {
    gap: 12px;
    padding: 3px 0;
  }

  article > :global(svg) {
    fill: currentColor;
    margin-left: auto;
  }

  article :global(.person-menu) {
    position: fixed;
  }

  .person-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    text-indent: -20px;
    padding-left: 20px;
  }

  .person-meta :global(span.text-block:first-of-type) {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .person-meta.compact :global(span.text-block:first-of-type) {
    font-size: 14px;
  }

  .person-meta :global(span.text-block:not(:first-of-type)) {
    line-height: 16px;
    color: var(--fds-text-secondary);
  }

  img.team-photo {
    border-radius: 50%;
    box-shadow: inset 0 0 0 1.5px black;
    -webkit-user-drag: none;
    width: 36px;
    height: 36px;
  }

  .danger {
    color: var(--color-danger-800);
  }
  @media (prefers-color-scheme: dark) {
    .danger {
      color: var(--color-danger-300);
    }
  }
</style>
