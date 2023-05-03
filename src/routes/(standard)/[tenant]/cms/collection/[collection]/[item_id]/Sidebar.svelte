<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { SelectOne } from '$lib/common/Select';
  import { server } from '$utils/constants';
  import type { AwarenessUser, YStore } from '$utils/createYStore';
  import { formatISODate } from '$utils/formatISODate';
  import { openWindow } from '$utils/openWindow';
  import type { DeconstructedSchemaDefType } from '@jackbuehner/cristata-generator-schema';
  import { Button, IconButton, PersonPicture, Tooltip } from 'fluent-svelte';
  import type { Readable } from 'svelte/store';
  import type { PageData } from './$types';

  export let docInfo: {
    _id: string;
    createdAt: string | undefined;
    modifiedAt: string | undefined;
    collectionName: string;
  };
  export let disabled = false;
  export let ydoc: YStore['ydoc'];
  export let stageDef: DeconstructedSchemaDefType[0][1] | undefined;
  export let sharedData: Readable<Record<string, unknown>>;
  export let awareness: Readable<AwarenessUser[] | null>;
  export let tenant: string;
</script>

<aside class="wrapper">
  <div class="button-row">
    <Button>
      <FluentIcon name="MoreHorizontal16Regular" mode="buttonIconLeft" />
      Action 1
    </Button>
    <Button>
      <FluentIcon name="MoreHorizontal16Regular" mode="buttonIconLeft" />
      Action 2
    </Button>
    <Button class="solid-icon-button">
      <FluentIcon name="MoreHorizontal16Regular" mode="buttonIconLeft" />
    </Button>
  </div>

  <div class="section-title">Document information</div>
  <div class="doc-info-row">
    <div>ID</div>
    <div>{docInfo._id.slice(0, 24)}</div>
  </div>
  <div class="doc-info-row">
    <div>Created</div>
    <div>
      {#if docInfo.createdAt}
        {formatISODate(docInfo.createdAt, undefined, undefined, true)}
      {:else}
        ⋯
      {/if}
    </div>
  </div>
  <div class="doc-info-row">
    <div>Last updated</div>
    <div>
      {#if docInfo.modifiedAt}
        {formatISODate(docInfo.modifiedAt, undefined, undefined, true)}
      {:else}
        ⋯
      {/if}
    </div>
  </div>

  {#if stageDef}
    <div class="section-title">Stage</div>
    <SelectOne
      disabled={disabled || $sharedData.stage === 5.2}
      {ydoc}
      ydocKey="stage"
      options={stageDef.field?.options?.map((opt) => {
        return {
          label: opt.label,
          _id: opt.value.toString(),
          disabled: opt.disabled,
        };
      }) || []}
      showCurrentSelectionOnDropdown
      hideSelected={false}
    />
  {/if}

  <div class="section-title">Current editors</div>
  <div style="margin-left: -8px; display: flex; flex-direction: row; flex-wrap: wrap;">
    {#if $awareness}
      {#each [...$awareness, ...$awareness, ...$awareness, ...$awareness, ...$awareness, ...$awareness, ...$awareness, ...$awareness] as user, index}
        {@const left =
          index === 0 ||
          index === 1 ||
          index === 6 ||
          index === 7 ||
          index === 12 ||
          index === 13 ||
          index === 18 ||
          index === 19 ||
          index === 24}
        {@const right =
          index === 4 ||
          index === 5 ||
          index === 10 ||
          index === 11 ||
          index === 16 ||
          index === 17 ||
          index === 22 ||
          index === 23}
        <Tooltip text={user.name} delay={0} alignment={left ? 'start' : right ? 'end' : 'center'} followCursor>
          <IconButton
            href={`/${tenant}/profile/${user._id}`}
            on:click={(evt) => {
              evt.preventDefault();
              openWindow(
                `/${tenant}/profile/${user._id}`,
                'sidebar_user' + docInfo._id + user._id,
                'location=no',
                { width: 500, height: 700 }
              );
            }}
          >
            <PersonPicture size={26} src={user.photo} alt={user.name} />
          </IconButton>
        </Tooltip>
      {/each}
    {/if}
  </div>

  <div class="section-title">Preview</div>

  {#if docInfo.collectionName === 'File'}
    <div class="section-title">Download</div>
    <Button
      onClick={async () => {
        const href = `${import.meta.env.VITE_API_PROTOCOL}//${
          import.meta.env.VITE_API_BASE_URL
        }/filestore/${tenant}/${docInfo._id}`;
        window.open(href, `sidebar_preview` + docInfo._id + 'File', 'location=no');
      }}
    >
      <FluentIcon name="Open24Regular" mode="buttonIconLeft" />
      Open file for download
    </Button>
  {/if}

  <div class="section-title">Access</div>
  <div class="section-title">Versions</div>
</aside>

<style>
  aside.wrapper {
    --border-color: var(--color-neutral-light-200);
    border-left: 1px solid var(--border-color);
    width: 320px;
    height: 100%;
    overflow: hidden auto;
    padding: 20px;
    box-sizing: border-box;
  }
  @media (prefers-color-scheme: dark) {
    aside.wrapper {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  .button-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin: 20px 0 10px 0;
  }

  .button-row :global(.button:not(:last-of-type)) {
    flex-grow: 1;
  }

  aside :global(.solid-icon-button) {
    padding-inline: 7px;
  }
  aside :global(.solid-icon-button .button-icon) {
    margin: 0 !important;
  }

  div.section-title {
    font-family: var(--fds-font-family-text);
    font-size: 12px;
    font-weight: 400;
    text-decoration: none;
    opacity: 0.8;
    line-height: 48px;
    margin: 0px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  div.doc-info-row {
    font-family: var(--fds-font-family-text);
    font-size: 14px;
    line-height: 24px;
    margin: 0 0 4px 0;
    font-weight: 400;
    text-decoration: none;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
  div.doc-info-row:nth-of-type(1) {
    opacity: 0.9;
  }
  div.doc-info-row:nth-of-type(2) {
    opacity: 0.8;
  }
</style>
