<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import FluentIcon from '$common/FluentIcon.svelte';
  import { PageSubtitle, PageTitle } from '$common/PageTitle';
  import { TileButton } from '$common/TileButton';
  import RecentActivity from '$lib/home/RecentActivity.svelte';
  import { ItemsRow } from '$react/Home/ItemsRow';
  import { notEmpty } from '$utils/notEmpty';
  import { uncapitalize } from '$utils/uncapitalize';
  import { copy } from 'copy-anything';
  import { Button, Expander, TextBlock } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ recentActivity } = data);
  $: if (browser) document.title = 'Cristata';

  let showBugFixes = false;
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
      if (item.label === 'API') item.label = 'Playground';
      if (item.label === 'Configure') item.label = 'Administration';
      return item;
    }) as { icon, label, to }}
    <TileButton href="/{data.tenant}{to}">
      {label}
      <FluentIcon name={icon} slot="icon" />
    </TileButton>
  {/each}
</div>

<PageSubtitle>Updates</PageSubtitle>

<div class="margin">
  <Expander>
    <FluentIcon name="Megaphone24Regular" slot="icon" />
    What's new to Cristata (August 2023)
    <svelte:fragment slot="content">
      <TextBlock tag="span" variant="subtitle" style="font-size: 15px;">Navigation</TextBlock>
      <ul style="padding-inline-start: 24px; line-height: 1.5; margin-top: 0;">
        <li>
          <b>Mobile support:</b> The navigation pane automatically switches to collapsed mode on small screens so
          it does not block the page.
        </li>
        <li>
          <b>Better connection:</b> Cristata will no longer give up on connecting to the collaboration server when
          the connection is lost and there are unsaved changes.
        </li>
      </ul>
      <TextBlock tag="span" variant="subtitle" style="font-size: 15px;">Document editor</TextBlock>
      <ul style="padding-inline-start: 24px; line-height: 1.5; margin-top: 0;">
        <li>
          <b>Easy previews:</b> Quickly switch between composing, commenting, and previewing. In rich text editors,
          use the dropdown in the titlebar to switch modes. In other editors, use the tabs at the top of the page
          to switch modes.
        </li>
        <li>
          <b>Remove links:</b> You can now remove existing links in rich text editors via the ribbon menu.
        </li>
        <li>
          <b>Improved performance:</b> The document editor has been carefully rewritten to perform better than the
          previous version.
        </li>
        <li>
          <b>Increased screen size support:</b> The sidebar automatically collapses when the screen is too narrow.
          Previews show beside the editor on wide screens for side-by-side editing and previewing.
        </li>
        <li>
          <b>Draggable reference selections:</b> Fields that reference documents in other collections (e.g., a reference
          to the users collection) allow dragging and dropping entries between fields that reference the same collections.
        </li>
      </ul>
      <TextBlock tag="span" variant="subtitle" style="font-size: 15px;">Security and tokens</TextBlock>
      <ul style="padding-inline-start: 24px; line-height: 1.5; margin-top: 0;">
        <li>
          <b>API Tokens:</b> Tokens can now be edited in the Administration app. You no longer need to email Cristata
          support to set up tokens!
        </li>
      </ul>
      {#if showBugFixes}
        <TextBlock tag="span" variant="subtitle" style="font-size: 15px;">Bug fixes</TextBlock>
        <ul style="padding-inline-start: 24px; line-height: 1.5; margin-top: 0;">
          <li>fix: do not fail to navigate from fullscreen richtext editor</li>
          <li>fix: always get team label for sidebar</li>
          <li>fix: improve timing of sidebar action button visiblity</li>
          <li>fix: require publish timestamps to be valid before publish</li>
          <li>fix: disable readonly schema fields</li>
          <li>fix: actually add text value to array on arrow click</li>
          <li>fix: disable editor fields when proper conditions are met</li>
          <li>fix: use correct listener for hocuspocus (dis)connect</li>
          <li>fix: properly redirect to tenant</li>
          <li>fix: reduce excessive spacing in field descriptions</li>
          <li>fix: use full reference objects when updating docArray data</li>
          <li>fix: ensure that doc array never has duplicates</li>
          <li>fix: do not autoplay youtube widget</li>
          <li>fix: handle case where font family and size are not specified in rich text options</li>
          <li>fix: hide hover effects when ribbon button disabled</li>
          <li>fix: handle zenozeng/color-hash#42</li>
          <li>fix: optimize photo widget node view</li>
        </ul>
      {:else}
        <Button on:click={() => (showBugFixes = !showBugFixes)}>Show bug fixes</Button>
      {/if}
    </svelte:fragment>
  </Expander>
  <Expander>
    <FluentIcon name="Megaphone24Regular" slot="icon" />
    What's new to Cristata (April 2023)
    <svelte:fragment slot="content">
      <ul style="padding-inline-start: 24px; line-height: 1.5;">
        <li>
          <b>Optimized photo widgets:</b> Embdeded photo widgets use smaller photo sizes for better performance.
          Photo widgets no longer check photo metadata when any text changes and instead only update metadata on
          first load.
        </li>
        <li>
          <b>Clear usage metrics and billing:</b> The usage metrics and billing pages were re-built to include more
          information.
        </li>
        <li>
          <b>More settings:</b> Configure field descriptions and permissions for the photo library and user profiles
          app.
        </li>
      </ul>
    </svelte:fragment>
  </Expander>
  <!-- <Expander>
    <FluentIcon name="Megaphone24Regular" slot="icon" />
    What's new to Cristata (March 2023)
    <svelte:fragment slot="content">
      <ul style="padding-inline-start: 24px; line-height: 1.5;">
        <li>
          <b>New photo library:</b> View and load more photos at once, easily search for photos, select unlimited
          photos, and set notes for each photo.
        </li>
        <li>
          <b>Collection page layouts:</b> Use the "View" menu to switch layouts. Enable the details pane for easy
          access to document details.
        </li>
        <li>
          <b>Revamped teams app:</b> Easily add invite new members and add them to your team at the same time.
        </li>
        <li>
          <b>Improved profile details:</b> View which documents reference a profile and other account details in
          the "Advanced" section.
        </li>
        <li>
          <b>Better navigation:</b> The navigation pane is now always visible – even while in a full screen editor.
          Expanded menus are no longer lost when toggling between the collapsed and uncollapsed navigation pane mode.
        </li>
        <li>
          <b>Administration:</b> View events, create webhooks, and configure the profiles and photos apps.
        </li>
      </ul>
    </svelte:fragment>
  </Expander> -->
  <!-- <Expander>
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
  </Expander> -->
  <!-- <Expander>
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
  </Expander> -->
</div>

<PageSubtitle>Activity</PageSubtitle>

<div class="margin">
  <Expander expanded>
    <FluentIcon name="Pulse24Regular" slot="icon" />
    Recent activity
    <svelte:fragment slot="content">
      <RecentActivity
        activities={($recentActivity.data?.activities?.docs || []).filter(notEmpty)}
        tenant={data.tenant}
        configuration={data.configuration}
        loading={$recentActivity.loading && !$recentActivity.data?.activities?.docs}
      />
    </svelte:fragment>
  </Expander>
  <Expander href="/{data.tenant}/cms/workflow">
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
              goto(`/${data.tenant}${row.to.idPrefix}`);
            }}
            href="/{data.tenant}{row.to.idPrefix}"
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
