<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { UsersListQuery } from '$graphql/graphql';
  import { queryCacheStore } from '$graphql/query';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import NavigationView from '$lib/common/NavigationView.svelte';
  import { useCreateSchema } from '$react/configuration/CollectionSchemaPage/hooks/schema-modals/useCreateSchema';
  import { PlaygroundNavigation } from '$react/playground/PlaygroundNavigation';
  import { collapsedPane } from '$stores/collapsedPane';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { server } from '$utils/constants';
  import { hasKey } from '$utils/hasKey';
  import { notEmpty } from '$utils/notEmpty';
  import { copy } from 'copy-anything';
  import {
    Flyout,
    MenuFlyout,
    MenuFlyoutDivider,
    MenuFlyoutItem,
    TextBlock,
    ToggleSwitch,
  } from 'fluent-svelte';
  import { hooks } from 'svelte-preprocess-react';
  import { useInviteUserModal } from '../../hooks/useCustomModal';
  import type { LayoutData } from '../../routes/(standard)/[tenant]/$types';

  export let data: LayoutData;
  $: ({ basicProfiles, basicTeams } = data);

  $: isConfigRoute = $page.url.pathname.includes(`/${data.authUser.tenant}/configuration/`);
  $: isCmsRoute = $page.url.pathname.includes(`/${data.authUser.tenant}/cms/`);
  $: isProfilesRoute = $page.url.pathname.includes(`/${data.authUser.tenant}/profile/`);
  $: isTeamsRoute = $page.url.pathname.includes(`/${data.authUser.tenant}/teams`);
  $: isApiPage = $page.url.pathname.includes(`/${data.authUser.tenant}/playground`);

  $: allMainMenuItems = data.configuration?.navigation.main
    .filter(notEmpty)
    .map((_item) => {
      const item = copy(_item);
      if (item.label === 'CMS') {
        item.label = 'Content Manager';
        item.to = '/cms';
      }
      if (item.label === 'Profiles') {
        const searchParams = new URLSearchParams();
        searchParams.set('_id', data.authUser._id.toHexString());
        searchParams.set('name', data.authUser.name);
        item.to = `/profile/${data.authUser._id}?${searchParams}`;
      }
      if (item.label === 'API') item.label = 'Data playground';
      if (item.label === 'Configure') item.label = 'Administration';
      return item;
    })
    .map((item) => {
      return {
        label: item.label,
        href: `/${data.authUser.tenant}${item.to}`,
        icon: item.icon,
        selected:
          item.label !== 'Home'
            ? $page?.url?.pathname?.includes(`/${data.authUser.tenant}${item.to}`)
            : undefined,
      };
    });

  $: mainMenuItems = [
    {
      label: 'Dashboard',
      icon: 'Home16Regular',
      href: `/${data.authUser.tenant}`,
    },
    {
      label: 'Apps',
      icon: 'Apps16Regular',
      type: 'expander',
      children: allMainMenuItems?.filter((item) => item.label !== 'Home' && item.label !== 'Dashboard'),
    },
    {
      label: 'footer',
      children: [
        {
          label: 'hr',
        },
        ...(isConfigRoute
          ? [
              {
                label: 'Toolbox',
                icon: 'Toolbox16Regular',
                onClick: () => {
                  toolboxFlyoutOpen = !toolboxFlyoutOpen;
                },
              },
            ]
          : []),
        {
          label: 'Settings',
          icon: 'Settings16Regular',
          onClick: () => {
            settingFlyoutOpen = !settingFlyoutOpen;
          },
        },
      ],
    },
  ];

  $: profilesListMenuItems = ($basicProfiles.data?.users?.docs || [])
    .filter(notEmpty)
    .filter((profile) => {
      if (hideInactiveUsers) return !profile.r;
      return true;
    })
    .map((profile) => {
      if (sortUsersByLastName) {
        const parenthesis = profile.name.match(/\(.+?\)/g);
        const names = profile.name
          .replace(/\(.+?\)/g, '')
          .trim()
          .split(' ');
        const lastName = names.slice(-1)[0];
        const remainingNames = names.slice(0, -1);
        return {
          ...profile,
          name: `${lastName}${remainingNames ? `, ${remainingNames.join(' ')}` : ''} ${(parenthesis || []).join(
            ' '
          )}`.trim(),
          originalName: profile.name,
        };
      }
      return profile;
    })
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    .reduce<
      {
        char: string;
        profiles: (NonNullable<UsersListQuery['users']>['docs'][0] & { originalName?: string })[];
      }[]
    >((groups, profile) => {
      const char = profile.name[0].toUpperCase();
      const group = groups.find((group) => group.char === char);
      if (!group) {
        groups.push({ char, profiles: [profile] });
        return groups;
      }
      group.profiles.push(profile);
      return groups;
    }, [])
    .map((group) => {
      return [
        {
          label: group.char,
          type: 'category',
        },
        ...group.profiles.map((profile) => {
          const url = new URL(`https://cristata.app/${data.authUser.tenant}/profile/${profile._id}`);
          url.searchParams.set('_id', profile._id);
          url.searchParams.set('name', profile.originalName || profile.name);
          if (profile.c) url.searchParams.set('current_title', profile.c);

          return {
            label: profile.name,
            icon: `${server.location}/v3/${data.authUser.tenant}/user-photo/${profile._id}`,
            href: `${url.pathname}${url.search}`,
          };
        }),
      ];
    })
    .flat();

  $: routeMenuItems = isConfigRoute
    ? [
        {
          label: 'hr',
        },
        {
          label: 'Billing',
          type: 'category',
        },
        {
          label: 'Service usage',
          href: `/${data.authUser.tenant}/configuration/billing/usage`,
          icon: 'TopSpeed20Regular',
        },
        {
          label: 'Payments & invoices',
          href: `/${data.authUser.tenant}/configuration/billing/payments`,
          icon: 'ReceiptMoney20Regular',
        },
        {
          label: 'Security',
          type: 'category',
        },
        {
          label: 'Secrets',
          href: `/${data.authUser.tenant}/configuration/security/tokens-secrets`,
          icon: 'Key20Regular',
        },
        {
          label: 'Apps',
          type: 'category',
        },
        {
          label: 'Content Management System',
          href: `/${data.authUser.tenant}/configuration/app/cms`,
          icon: 'ContentView20Regular',
        },
        {
          label: 'System collections',
          type: 'category',
        },
        {
          label: 'File',
          href: `/${data.authUser.tenant}/configuration/system-collection/File/action-access`,
          icon: 'CircleSmall20Filled',
        },
        {
          label: 'Photo',
          href: `/${data.authUser.tenant}/configuration/system-collection/Photo/action-access`,
          icon: 'CircleSmall20Filled',
        },
        {
          label: 'Schemas',
          type: 'category',
        },
        ...(
          data.configuration?.collections
            ?.map((col) => {
              if (!col) return;
              if (col.name === 'File') return;
              if (col.name === 'Photo') return;
              if (col.name === 'Activity') return;
              return {
                label: col.name,
                href: `/${data.authUser.tenant}/configuration/schema/${col.name}#0`,
                icon: 'CircleSmall20Filled',
              };
            })
            .filter(notEmpty) || []
        ).sort((a, b) => a.label.localeCompare(b.label)),
      ]
    : isCmsRoute
    ? [
        {
          label: 'hr',
        },
        {
          label: 'Workflow',
          href: `/${data.authUser.tenant}/cms/workflow`,
          icon: 'DataUsage24Regular',
        },
        {
          label: 'hr',
        },
        ...(data.configuration?.navigation.cmsNav || [])
          .map((group) => {
            if (group?.label === 'Collections') {
              return [
                {
                  label: 'Files',
                  icon: 'Folder24Regular',
                  type: 'expander',
                  children: (group?.items || [])
                    .filter(notEmpty)
                    .filter((item) => item.label === 'Files' || item.label === 'Photo library')
                    .map((item) => {
                      return {
                        label: item.label,
                        href: `/${data.authUser.tenant}${item.to}`,
                        icon:
                          item.label === 'Files'
                            ? 'Folder24Regular'
                            : item.label === 'Photo library'
                            ? 'TabDesktopImage24Regular'
                            : item.icon,
                      };
                    }),
                },
                {
                  label: 'Collections',
                  icon: 'Collections24Regular',
                  type: 'expander',
                  children: (group?.items || [])
                    .filter(notEmpty)
                    .filter(
                      (item) =>
                        item.label !== 'Files' && item.label !== 'Photo library' && item.label !== 'Activities'
                    )
                    .map((item) => {
                      return {
                        label: item.label,
                        href: `/${data.authUser.tenant}${item.to}`,
                        icon: item.icon,
                      };
                    }),
                },
              ];
            }

            return [
              {
                label: group?.label,
                icon: (group?.items || []).filter(notEmpty)[0]?.icon || 'CircleSmall20Filled',
                type: 'expander',
                children: (group?.items || []).filter(notEmpty).map((item) => {
                  return {
                    label: item.label,
                    href: `/${data.authUser.tenant}${item.to}`,
                    icon: item.icon,
                  };
                }),
              },
            ];
          })
          .flat(),
      ]
    : isProfilesRoute
    ? [
        {
          label: 'hr',
        },
        {
          label: 'My profile',
          icon: `${server.location}/v3/${data.authUser.tenant}/user-photo/${data.authUser._id}`,
          href: (() => {
            const searchParams = new URLSearchParams();
            searchParams.set('_id', data.authUser._id.toHexString());
            searchParams.set('name', data.authUser.name);
            return `/${data.authUser.tenant}/profile/${data.authUser._id}?${searchParams}`;
          })(),
        },
        {
          label: 'hr',
        },
        ...($collapsedPane
          ? [
              {
                label: 'All profiles',
                icon: 'People16Regular',
                type: 'expander',
                children: profilesListMenuItems,
              },
            ]
          : profilesListMenuItems),
      ]
    : isTeamsRoute
    ? [
        {
          label: 'hr',
        },
        {
          label: 'All teams',
          icon: 'ContactCardGroup16Regular',
          href: `/${data.authUser.tenant}/teams/home`,
        },
        ...($collapsedPane
          ? []
          : [
              {
                label: 'hr',
              },
              ...($basicTeams.data?.teams?.docs || [])
                .filter(notEmpty)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((team) => {
                  const searchParams = new URLSearchParams();
                  searchParams.set('name', team.name);
                  return {
                    label: `${team.organizers.length + team.members.length}::${team.name}`,
                    icon: 'PeopleTeam16Regular',
                    href: `/${data.authUser.tenant}/teams/${team._id}?${searchParams}`,
                  };
                })
                .filter(notEmpty),
            ]
        ).flat(),
      ]
    : isApiPage && !$collapsedPane
    ? [
        {
          label: 'hr',
        },
        {
          label: 'Explorer',
          type: 'category',
        },
      ]
    : [];

  $: menuFooterItems =
    isConfigRoute || isProfilesRoute || isTeamsRoute
      ? [
          {
            label: 'footer',
            children: [
              {
                label: 'hr',
              },
              {
                label: 'Toolbox',
                icon: 'Toolbox16Regular',
                onClick: () => {
                  toolboxFlyoutOpen = !toolboxFlyoutOpen;
                },
              },
              {
                label: 'Settings',
                icon: 'Settings16Regular',
                onClick: () => {
                  settingFlyoutOpen = !settingFlyoutOpen;
                },
              },
            ],
          },
        ]
      : [
          {
            label: 'footer',
            children: [
              {
                label: 'hr',
              },
              {
                label: 'Settings',
                icon: 'Settings16Regular',
                onClick: () => {
                  settingFlyoutOpen = !settingFlyoutOpen;
                },
              },
            ],
          },
        ];

  $: collectionNames = data.configuration?.collections?.map((col) => col?.name).filter(notEmpty) || [];
  $: createSchemaHookStore = hooks(() => useCreateSchema(collectionNames));
  $: inviteUserModalHookStore = hooks(() => useInviteUserModal());

  let hideInactiveUsers = true;
  let sortUsersByLastName = true;

  let settingFlyoutOpen = false;
  let toolboxFlyoutOpen = false;
</script>

<NavigationView
  mode={'left'}
  menuItems={[...menuFooterItems, ...mainMenuItems, ...routeMenuItems]}
  showBackArrow
  compact={$compactMode}
  bind:collapsedPane={$collapsedPane}
>
  <svelte:fragment slot="custom" />
  <svelte:fragment slot="internal">
    {#if isApiPage && !$collapsedPane}
      <react:PlaygroundNavigation />
    {/if}
  </svelte:fragment>
</NavigationView>

<div class="settings-flyout" class:collapsedPane={$collapsedPane}>
  <Flyout bind:open={settingFlyoutOpen} placement="right">
    <svelte:fragment slot="flyout">
      <div class="settings-flyout-flex">
        <TextBlock variant="subtitle" style="margin-bottom: 10px;">Settings</TextBlock>
        <ToggleSwitch bind:checked={$compactMode}>Compact mode</ToggleSwitch>
        <ToggleSwitch
          checked={$motionMode === 'reduced'}
          on:change={(evt) => {
            if (evt.target && hasKey(evt.target, 'checked') && evt.target.checked) $motionMode = 'reduced';
            else $motionMode = 'no-preference';
          }}
        >
          Reduce motion
        </ToggleSwitch>
      </div>
    </svelte:fragment>
  </Flyout>
</div>

<div class="toolbox-flyout" class:compactMode={$compactMode} class:collapsedPane={$collapsedPane}>
  <MenuFlyout alignment="start" placement="top" bind:open={toolboxFlyoutOpen}>
    <svelte:fragment slot="flyout">
      {#if isConfigRoute}
        {#if $createSchemaHookStore}
          {@const [, showCreateWindow] = $createSchemaHookStore}
          <MenuFlyoutItem on:click={showCreateWindow}>
            <svelte:fragment slot="icon">
              <FluentIcon name="Add16Regular" />
            </svelte:fragment>
            Add new collection (schema)
          </MenuFlyoutItem>
        {/if}
        <MenuFlyoutDivider />
        <MenuFlyoutItem
          indented
          on:click={() => goto(`/${data.authUser.tenant}/configuration/billing/payments`)}
        >
          Invoices
        </MenuFlyoutItem>
        <MenuFlyoutItem
          indented
          on:click={() => goto(`/${data.authUser.tenant}/configuration/billing/payments`)}
        >
          Billing information
        </MenuFlyoutItem>
      {/if}
      {#if isProfilesRoute}
        {#if $inviteUserModalHookStore}
          {@const [, showModal] = $inviteUserModalHookStore}
          <MenuFlyoutItem on:click={showModal}>
            <svelte:fragment slot="icon">
              <FluentIcon name="PersonAdd20Regular" />
            </svelte:fragment>
            Invite new user
          </MenuFlyoutItem>
        {/if}
        <MenuFlyoutDivider />
        <MenuFlyoutItem on:click={() => $basicProfiles.refetch()}>
          <svelte:fragment slot="icon">
            <FluentIcon name="ArrowClockwise16Regular" />
          </svelte:fragment>
          Refresh users list
        </MenuFlyoutItem>
        <MenuFlyoutDivider />
        <MenuFlyoutItem indented={!hideInactiveUsers} on:click={() => (hideInactiveUsers = !hideInactiveUsers)}>
          <svelte:fragment slot="icon">
            {#if hideInactiveUsers}
              <FluentIcon name="Checkmark20Regular" />
            {/if}
          </svelte:fragment>
          Hide inactive users
        </MenuFlyoutItem>
        <MenuFlyoutItem
          indented={!sortUsersByLastName}
          on:click={() => (sortUsersByLastName = !sortUsersByLastName)}
        >
          <svelte:fragment slot="icon">
            {#if sortUsersByLastName}
              <FluentIcon name="Checkmark20Regular" />
            {/if}
          </svelte:fragment>
          Sort by last name (family name)
        </MenuFlyoutItem>
      {/if}
      {#if isTeamsRoute}
        {#if $inviteUserModalHookStore}
          {@const [, showModal] = $inviteUserModalHookStore}
          <MenuFlyoutItem on:click={showModal}>
            <svelte:fragment slot="icon">
              <FluentIcon name="PersonAdd20Regular" />
            </svelte:fragment>
            Invite new user
          </MenuFlyoutItem>
        {/if}
        <MenuFlyoutDivider />
        <MenuFlyoutItem on:click={() => $basicTeams.refetch()}>
          <svelte:fragment slot="icon">
            <FluentIcon name="ArrowClockwise16Regular" />
          </svelte:fragment>
          Refresh teams list
        </MenuFlyoutItem>
      {/if}
    </svelte:fragment>
  </MenuFlyout>
</div>

<style>
  .settings-flyout {
    position: fixed;
    z-index: 99999;
    left: 290px;
    bottom: 50px;
  }
  .settings-flyout.collapsedPane {
    left: 50px;
  }

  .settings-flyout-flex {
    display: flex;
    flex-direction: column;
  }

  .toolbox-flyout {
    position: fixed;
    left: 46px;
    bottom: 70px;
    z-index: 9999;
  }
  .toolbox-flyout.compactMode {
    bottom: 56px;
  }
  .toolbox-flyout.collapsedPane {
    left: 55px;
    bottom: 30px;
  }
</style>
