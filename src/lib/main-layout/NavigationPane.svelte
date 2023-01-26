<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import NavigationView from '$lib/common/NavigationView.svelte';
  import { useCreateSchema } from '$react/configuration/CollectionSchemaPage/hooks/schema-modals/useCreateSchema';
  import { compactMode } from '$stores/compactMode';
  import { notEmpty } from '$utils/notEmpty';
  import {
    Flyout,
    MenuFlyout,
    MenuFlyoutDivider,
    MenuFlyoutItem,
    TextBlock,
    ToggleSwitch,
  } from 'fluent-svelte';
  import { hooks } from 'svelte-preprocess-react';
  import type { LayoutData } from '../../routes/(standard)/[tenant]/$types';

  export let data: LayoutData;

  $: isConfigRoute = $page.url.pathname.includes(`/${data.authUser.tenant}/configuration/`);

  const allMainMenuItems = data.configuration?.navigation.main
    .map((item) => {
      if (!item) return;
      return {
        label: item.label,
        href: `/${data.authUser.tenant}${item.to}`,
        icon: item.icon,
      };
    })
    .filter(notEmpty);

  $: mainMenuItems = [
    allMainMenuItems?.find((item) => item.label === 'Home'),
    {
      label: 'Apps',
      icon: 'Apps16Regular',
      type: 'expander',
      children: allMainMenuItems?.filter((item) => item.label !== 'Home'),
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
        ...(data.configuration?.collections
          ?.map((col) => {
            if (!col) return;
            return {
              label: col.name,
              href: `/${data.authUser.tenant}/configuration/schema/${col.name}#0`,
              icon: 'CircleSmall20Filled',
            };
          })
          .filter(notEmpty) || []),
      ]
    : [];

  $: menuFooterItems = isConfigRoute
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

  let settingFlyoutOpen = false;
  let toolboxFlyoutOpen = false;
</script>

<NavigationView
  mode={'left'}
  hideMenuButton
  menuItems={[...mainMenuItems, ...routeMenuItems, ...menuFooterItems]}
  showBackArrow
  compact={$compactMode}
>
  <svelte:fragment slot="custom" />
</NavigationView>

<div class="settings-flyout">
  <Flyout bind:open={settingFlyoutOpen} placement="right">
    <svelte:fragment slot="flyout">
      <div class="settings-flyout-flex">
        <TextBlock variant="subtitle" style="margin-bottom: 10px;">Settings</TextBlock>
        <ToggleSwitch bind:checked={$compactMode}>Compact mode</ToggleSwitch>
      </div>
    </svelte:fragment>
  </Flyout>
</div>

<div class="toolbox-flyout" class:compactMode={$compactMode}>
  <MenuFlyout alignment="start" bind:open={toolboxFlyoutOpen}>
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
    </svelte:fragment>
  </MenuFlyout>
</div>

<style>
  .settings-flyout {
    position: fixed;
    z-index: 99999;
    left: 280px;
    bottom: 50px;
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
</style>
