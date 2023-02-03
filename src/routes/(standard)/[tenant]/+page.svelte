<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import FluentIcon from '$common/FluentIcon.svelte';
  import { PageSubtitle, PageTitle } from '$common/PageTitle';
  import { TileButton } from '$common/TileButton';
  import { ItemsRow } from '$react/Home/ItemsRow';
  import { RecentActivity } from '$react/Home/RecentActivity';
  import { notEmpty } from '$utils/notEmpty';
  import { uncapitalize } from '$utils/uncapitalize';
  import { copy } from 'copy-anything';
  import { Button, Expander } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<PageTitle>Dashboard</PageTitle>

<div class="margin apps">
  {#each (data?.configuration?.navigation.main || [])
    .filter(notEmpty)
    .filter(({ label }) => label !== 'Home' && label !== 'Dashboard')
    .map((_item) => {
      const item = copy(_item);
      if (item.label === 'CMS') {
        item.label = 'Content';
        item.to = '/cms';
      }
      if (item.label === 'Profiles') {
        const searchParams = new URLSearchParams();
        searchParams.set('_id', data.authUser._id.toHexString());
        searchParams.set('name', data.authUser.name);
        item.to = `/profile/${data.authUser._id}?${searchParams}`;
      }
      if (item.label === 'API') item.label = 'API Explorer';
      if (item.label === 'Configure') item.label = 'Administration';
      return item;
    }) as { icon, label, to }}
    <TileButton href="/{$page.params.tenant}{to}">
      {label}
      <FluentIcon name={icon} slot="icon" />
    </TileButton>
  {/each}
</div>

<PageSubtitle>Updates</PageSubtitle>

<div class="margin">
  <Expander>
    <FluentIcon name="Megaphone24Regular" slot="icon" />
    What's new to Cristata (February 2023)
    <svelte:fragment slot="content">
      <ul style="padding-inline-start: 24px; line-height: 1.5;">
        <li>
          <b>Introducing a brand-new navigation system:</b> All navigation can now be found on the left side of the
          page – it is no longer split into multiple locations. You can now easily collapse the navigation pane with
          the menu button so you can focus on creating and managing content.
        </li>
        <li>
          <b>Compact mode:</b> Want to see more at once? Enable compact mode in settings to reduce the space between
          some elements in the interface.
        </li>
        <li>
          <b>Fancy menus:</b> New dropdown menus, context menus, and flyouts feature the
          <a href="https://learn.microsoft.com/en-us/windows/apps/design/style/acrylic">acrylic blur effect</a>.
        </li>
      </ul>
    </svelte:fragment>
  </Expander>
  <Expander>
    <FluentIcon name="Megaphone24Regular" slot="icon" />
    What's new to Cristata (January 2023)
    <svelte:fragment slot="content">
      <ul style="padding-inline-start: 24px; line-height: 1.5;">
        <li>Added the workflow page for easy access to all in-progress documents across all collections.</li>
        <li>Added the ability to switch between accounts in different tenants in the profile menu.</li>
        <li>Enabled a dark scrollbar in dark mode.</li>
        <li>Add toast notifications when there is a Cristata app update.</li>
        <li>
          Changed the <i>Publish</i> button to an <i>Unpublish</i> button when documents are published.
        </li>
        <li>
          Included a <i>Last published</i> column in collection tables.
        </li>
        <li>Added the ability to add custom groups to the CMS navigation pane.</li>
        <li>
          Added new options for collection configurations:
          <ul>
            <li>
              Configure exact previews of how your documents will appear on your website. A preview tab will
              appear in the document editor when this option is enabled.
            </li>
            <li>Choose the plural label for collections, used in the CMS navigation pane.</li>
            <li>Add scope tags to collection labels.</li>
            <li>Use custom document name templates.</li>
            <li>
              Choose to edit a separate copy of published documents so your changes do not go live until they
              are ready.
            </li>
          </ul>
        </li>
        <li>
          Added the <i>Files</i> system collection. Every uploaded file recieves a link to view/download the file.
        </li>
        <li>
          Added the <i>Photos</i> system collection. Every uploaded photo can be viewed from anywhere using its link.
        </li>
      </ul>
    </svelte:fragment>
  </Expander>
</div>

<PageSubtitle>Activity</PageSubtitle>

<div class="margin">
  <Expander expanded>
    <FluentIcon name="Pulse24Regular" slot="icon" />
    Recent activity
    <svelte:fragment slot="content">
      <react:RecentActivity />
    </svelte:fragment>
  </Expander>
  <Expander href="/{$page.params.tenant}/cms/workflow">
    <FluentIcon name="DataUsage24Regular" slot="icon" />
    Workflow
    <svelte:fragment slot="side">
      {data.workflowCounts?.reduce((sum, stage) => (sum += stage.count), 0)} entries
    </svelte:fragment>
  </Expander>
</div>

{#if (data.dashboardConfig?.collectionRows || []).length > 0}
  <PageSubtitle>Recent</PageSubtitle>

  <div class="margin margin-bottom">
    {#each (data.dashboardConfig?.collectionRows || []).filter(notEmpty) as row, index}
      <Expander class="dashboard-collection-row-expander" expanded={index < 2}>
        <FluentIcon name={row.header.icon} slot="icon" />
        {row.header.label}
        <svelte:fragment slot="side">
          <Button
            on:click={(e) => {
              e.stopPropagation();
              e.preventDefault();
              goto(`/${$page.params.tenant}${row.to.idPrefix}`);
            }}
            href="/{$page.params.tenant}{row.to.idPrefix}"
          >
            View all {uncapitalize(row.header.label)}
          </Button>
        </svelte:fragment>
        <svelte:fragment slot="content">
          <react:ItemsRow query={row.query} dataKeys={row.dataKeys} arrPath={row.arrPath} to={row.to} />
        </svelte:fragment>
      </Expander>
    {/each}
  </div>
{/if}

<br />

<style>
  .margin {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  .margin-bottom {
    margin-bottom: 30px;
  }

  .apps {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
  }

  :global(.dashboard-collection-row-expander .expander-content) {
    overflow: auto;
  }
</style>
