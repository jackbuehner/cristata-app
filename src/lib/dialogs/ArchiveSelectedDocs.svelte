<script lang="ts">
  import { server } from '$utils/constants';
  import { uncapitalize } from '@jackbuehner/cristata-utils';
  import { Button, ContentDialog, InfoBar, ProgressRing } from 'fluent-svelte';
  import { print } from 'graphql';
  import { gql } from 'graphql-tag';

  export let open = false;

  export let tenant: string;

  export let selectedIds: string[];
  export let schemaName: string;
  export let byOne = '_id';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: (() => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let hasChanged = false;
  let loadingSubmit = false;
  let loadingCancel = false;

  async function addUser(selectedIds: string[]): Promise<boolean> {
    const ARCHIVE_ITEMS = gql`
      mutation {
        ${selectedIds.map((item, index) => {
          return `archiveItem${index}: ${uncapitalize(schemaName)}Hide(${byOne}: "${item}") {
            archived
          }`;
        })}
      }
    `;

    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(ARCHIVE_ITEMS),
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

    return res;
  }
</script>

<ContentDialog
  title="Archive selected item{selectedIds.length === 1 ? '' : 's'}?"
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

  <InfoBar severity="information" title="You can restore these documents later.">
    View and restore archived documents from <b>View</b> > <b>View archived</b>
  </InfoBar>

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      disabled={selectedIds.length === 0}
      on:click={async () => {
        if (selectedIds.length > 0) {
          loadingSubmit = true;
          const success = await addUser(selectedIds);
          if (success) {
            await handleAction?.();
            await handleSumbit?.();
            open = false;
          }
          loadingSubmit = false;
        }
      }}
    >
      {#if loadingSubmit}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Yes, archive item{selectedIds.length === 1 ? '' : 's'}
      {/if}
    </Button>
    <Button
      on:click={async () => {
        if (hasChanged) {
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
        No, cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>
