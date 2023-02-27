<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { VITE_API_BASE_URL, VITE_API_PROTOCOL } from '$env/static/public';
  import { StatelessCheckbox } from '$lib/common/Checkbox';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import Loading from '$lib/common/Loading.svelte';
  import ArchiveSelectedDocs from '$lib/dialogs/ArchiveSelectedDocs.svelte';
  import DeleteSelectedDocs from '$lib/dialogs/DeleteSelectedDocs.svelte';
  import { compactMode } from '$stores/compactMode';
  import { hasKey } from '$utils/hasKey';
  import type { SchemaDef as AppSchemaDef } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    renderComponent,
    type Column,
    type ColumnDef,
    type Row,
    type TableOptions,
  } from '@tanstack/svelte-table';
  import { Button } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import type { PageData } from './$types';
  import BulkActions from './BulkActions.svelte';
  import ValueCell from './ValueCell.svelte';

  export let collection: NonNullable<PageData['collection']>;
  export let schema: NonNullable<PageData['table']>['schema'];
  export let tableData: NonNullable<PageData['table']>['data'];
  export let tableDataFilter: NonNullable<PageData['table']>['filter'];
  export let tableDataSort: NonNullable<PageData['table']>['sort'];

  interface SchemaDef extends AppSchemaDef {
    docs?: undefined;
  }

  type Doc = NonNullable<NonNullable<NonNullable<typeof $tableData.data>['data']>['docs']>[0];

  // if the field is a body field that is rendered as a tiptap editor,
  // we want to open it in maximized mode for easy access to the editor
  const shouldOpenMaximized = schema.find(([key, def]) => key === 'body' && def.field?.tiptap);

  // row links behaviors
  const links = {
    href: `/${$page.params.tenant}/cms/collection/${$page.params.collection}`,
    hrefSuffixKey: collection.config?.data?.configuration?.collection?.by?.one || '_id',
    hrefSearch: shouldOpenMaximized ? '?fs=1&props=1' : undefined,
    windowName:
      shouldOpenMaximized && window.matchMedia('(display-mode: standalone)').matches ? 'editor' : undefined,
  };

  let columns: ColumnDef<Doc>[] = [];
  $: columns = [
    {
      accessorKey: '__checkbox',
      cell: (info) => {
        return renderComponent(ValueCell, {
          info,
          type: 'checkbox',
          key: '__checkbox',
          def: { type: 'Boolean' },
        });
      },
      size: 42,
      enableSorting: false,
    },
    ...(schema
      ?.sort((a, b) => {
        if ((a[1].column?.order || 1000) > (b[1].column?.order || 1000)) return 1;
        return -1;
      })
      .filter((x): x is [string, SchemaDef] => {
        const [key, def] = x;

        if (key === 'permissions.users') return false;
        if (key === 'permissions.teams') return false;
        if (key === 'people.created_by') return false;
        if (key === 'people.last_modified_by') return false;
        if (key === 'timestamps.modified_at') return false;
        if (key === 'timestamps.updated_at') return false;

        // an array of documents can not be represented by a column
        const isSubDocArray = def.type === 'DocArray';
        if (isSubDocArray) return false;

        // hide hidden columns
        if (def.column?.hidden === true) return false;

        return true;
      })
      .map(([key, def]): ColumnDef<Doc> | null => {
        // use predefined values for publish timestamps
        if (key === 'timestamps.published_at') {
          return {
            header: 'Last published',
            accessorKey: 'timestamps.published_at',
            cell: (info) => {
              const pub = info.getValue();
              const upd = info.row.getValue('timestamps.updated_at');

              if (typeof pub === 'string' && typeof upd === 'string') {
                if (new Date(upd) > new Date(pub))
                  return renderComponent(ValueCell, {
                    info,
                    key: 'timestamps.updated_at',
                    def: { type: 'Date' },
                  });
              }
              return renderComponent(ValueCell, {
                info,
                key: 'timestamps.published_at',
                def: { type: 'Date' },
              });
            },
            size: 190,
            enableSorting: true,
          };
        }

        if (def.column) {
          return {
            accessorKey: key,
            id: key,
            header: () => def.column?.label || key,
            size: parseInt(`${def.column.width}`) || 150,
            cell: (info) => renderComponent(ValueCell, { info, key, def }),
            enableSorting: def.column.sortable || false,
            enableMultiSort: def.column.sortable || false,
          };
        }
        return {
          accessorKey: key,
          id: key,
          header: () => key,
          size: 150,
          cell: (info) => renderComponent(ValueCell, { info, key, def }),
          enableSorting: false,
        };
      })
      .filter(notEmpty)
      .sort((a, b) => (a.id === 'timestamps.published_at' ? 1 : 0)) || []),
    {
      header: collection.schemaName === 'File' ? 'Uploaded by' : 'Created by',
      accessorKey: 'people.created_by',
      id: 'people.created_by',
      cell: (info) =>
        renderComponent(ValueCell, { info, key: 'people.created_by', def: { type: ['User', 'ObjectId'] } }),
      size: 150,
      enableSorting: false,
    },
    {
      header: 'Last modified by',
      accessorKey: 'people.last_modified_by',
      id: 'people.last_modified_by',
      cell: (info) =>
        renderComponent(ValueCell, {
          info,
          key: 'people.last_modified_by',
          def: { type: ['User', 'ObjectId'] },
        }),
      size: 150,
      enableSorting: false,
    },
    {
      header: 'Last modified',
      accessorKey: 'timestamps.modified_at',
      id: 'timestamps.modified_at',
      cell: (info) =>
        renderComponent(ValueCell, { info, key: 'timestamps.modified_at', def: { type: 'Date' } }),
      size: 190,
      enableSorting: true,
    },
  ];

  let colName = collection.colName;
  let data: Doc[] = [];
  let filter = JSON.stringify(tableDataFilter);
  let sort = JSON.stringify(tableDataSort);
  $: {
    if (
      data.length !== ($tableData?.data?.data?.docs || []).length ||
      colName !== collection.colName ||
      filter !== JSON.stringify(tableDataFilter) ||
      sort !== JSON.stringify(tableDataSort)
    ) {
      data = $tableData?.data?.data?.docs || [];
      colName = collection.colName;
      filter = JSON.stringify(tableDataFilter);
      sort = JSON.stringify(tableDataSort);
    }
  }

  $: options = writable<TableOptions<Doc>>({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    debugAll: true,
    enableSorting: true,
    enableMultiSort: true,
    manualSorting: true,
    manualFiltering: true,
    meta: {
      compactMode: $compactMode,
      noWrap: $compactMode,
    },
    initialState: {
      sorting: Object.entries(JSON.parse(sort) as typeof tableDataSort).map(([field, direction]) => {
        return {
          id: field,
          desc: direction === -1,
        };
      }),
    },
  });

  $: table = createSvelteTable(options);

  // dispatch sort event when sort changes
  const dispatch = createEventDispatcher();
  $: {
    const newSort: Record<string, 1 | -1> = {};
    $table.getState().sorting.map((value) => {
      newSort[value.id] = value.desc ? -1 : 1;
    });
    dispatch('sort', {
      old: JSON.parse(sort) as typeof tableDataSort,
      new: newSort,
    });
  }

  function handleRowClick(evt: PointerEvent | MouseEvent, row: Row<unknown>) {
    const lastRowIndex = lastSelectedRowIndex;
    const thisRowIndex = row.index;

    if (
      isPointerEvent(evt) &&
      evt.pointerType === 'mouse' &&
      !isInputElem(evt.target) &&
      !isCheckbox(evt.target)
    ) {
      // disable navigating by anchor tag on single click (use double click or enter or middle click instead)
      evt.preventDefault();

      // if control clicking, select with deselecting other rows
      if (evt.ctrlKey) {
        row.toggleSelected();
      }
      // if shift clicking, deselect all and then select all from this row to last selected row
      else if (evt.shiftKey) {
        $table.toggleAllRowsSelected(false);
        if (lastRowIndex > thisRowIndex) {
          $table
            .getRowModel()
            .rows.filter((row) => row.index >= thisRowIndex && row.index <= lastRowIndex)
            .forEach((row) => {
              row.toggleSelected(true);
            });
        } else if (lastRowIndex <= thisRowIndex) {
          $table
            .getRowModel()
            .rows.filter((row) => row.index <= thisRowIndex && row.index >= lastRowIndex)
            .forEach((row) => {
              row.toggleSelected(true);
            });
        }
      }
      // otherise, deselect all rows before selecting this row
      else {
        $table.toggleAllRowsSelected(false);
        row.toggleSelected();
      }
      // update the last selected row index once we are done
      lastSelectedRowIndex = thisRowIndex;
    }
    evt.stopPropagation();
  }

  function isPointerEvent(evt: PointerEvent | MouseEvent): evt is PointerEvent {
    if (hasKey(evt, 'pointerType')) return true;
    return false;
  }

  function isInputElem(target: EventTarget | null): target is HTMLInputElement {
    return !!target && hasKey(target, 'nodeName') && target.nodeName === 'INPUT';
  }

  function isCheckbox(target: EventTarget | null): target is Element {
    if (!target) return false;

    if (hasKey(target, 'class') && typeof target.class === 'string') {
      return target.class.includes('checkbox');
    }
    if (hasKey(target, 'nodeName')) {
      return target.nodeName === 'INPUT' || target.nodeName === 'svg' || target.nodeName === 'path';
    }

    return false;
  }

  let lastSelectedRowIndex = 0;
  $: selectedIds = $table
    .getSelectedRowModel()
    .rows.map(
      (row) => row.original[collection.config?.data?.configuration?.collection?.by.one || '_id']
    ) as string[];

  $: firstSelectedHref = `${links.href}/${
    ($tableData?.data?.data?.docs || []).find((doc: { _id: string }) => doc._id === selectedIds[0])?.[
      links.hrefSuffixKey
    ]
  }${links.hrefSearch || ''}`;

  function toggleSort(column: Column<Doc>, sortable: boolean, shiftKey?: boolean) {
    if (sortable) column.toggleSorting(undefined, shiftKey);
  }

  export let loadingMore = false;
  let archiveDialogOpen = false;
  let deleteDialogOpen = false;
</script>

<div class="wrapper">
  <div role="table" class:compact={$table.options.meta?.compactMode}>
    <div role="rowgroup" class="thead">
      {#each $table.getHeaderGroups() as headerGroup}
        <div role="row">
          {#each headerGroup.headers as header}
            {@const sortable = header.column.getCanSort()}
            <span
              role="columnheader"
              style="width: {header.getSize()}px;"
              class:sortable
              tabindex="0"
              on:keyup={(evt) => {
                if (evt.key === 'Enter') toggleSort(header.column, sortable, evt.shiftKey);
              }}
              on:click={(evt) => toggleSort(header.column, sortable, evt.shiftKey)}
            >
              {#if header.id === '__checkbox'}
                <StatelessCheckbox
                  checked={$table.getIsAllRowsSelected()}
                  indeterminate={$table.getIsSomeRowsSelected()}
                  size={$compactMode ? 16 : 18}
                  labelStyle="display: flex; margin-left: 3px;"
                  on:click={(evt) => {
                    evt.stopPropagation();
                  }}
                  on:change={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $table.toggleAllRowsSelected();
                  }}
                />
              {:else if !header.isPlaceholder}
                <svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
                {#if sortable}
                  <span class="sort-chevron" style="--width: {header.getSize()}px">
                    {#if header.column.getIsSorted() === 'asc'}
                      <FluentIcon name="ChevronUp16Regular" />
                    {:else if header.column.getIsSorted() === 'desc'}
                      <FluentIcon name="ChevronDown16Regular" />
                    {/if}
                  </span>
                {/if}
              {/if}
            </span>
          {/each}
        </div>
      {/each}
    </div>
    <div role="rowgroup" class="tbody">
      {#each $table.getRowModel().rows as row, i}
        {@const href = `${links.href}/${row.original?.[links.hrefSuffixKey]}${links.hrefSearch || ''}`}
        <a
          role="row"
          {href}
          target={links.windowName}
          on:click={(evt) => handleRowClick(evt, row)}
          on:dblclick={(evt) => {
            if (!isInputElem(evt.target) && !isCheckbox(evt.target)) goto(href);
          }}
        >
          {#each row.getVisibleCells() as cell}
            <span role="cell" style="width: {cell.column.getSize()}px">
              {#if cell.column.id === '__checkbox'}
                <StatelessCheckbox
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  indeterminate={row.getIsSomeSelected()}
                  size={$compactMode ? 16 : 18}
                  labelStyle="display: flex; margin-left: 3px;"
                  on:click={(evt) => {
                    console.log(evt);
                    evt.stopPropagation();
                  }}
                  on:change={(evt) => {
                    console.log(evt.detail);
                    row.toggleSelected(evt.detail.checked);
                    lastSelectedRowIndex = row.index;
                  }}
                />
              {:else}
                <span class="cell-content" class:noWrap={$table.options.meta?.noWrap}>
                  <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
                </span>
              {/if}
            </span>
          {/each}
        </a>
      {/each}
    </div>
  </div>
  {#if ($tableData.data?.data?.totalDocs || 0) === 0 && $tableData.loading}
    <Loading message="Loading documents..." style="padding: 20px;" />
  {/if}
  {#if ($tableData.data?.data?.totalDocs || 0) > ($tableData.data?.data?.docs || []).length}
    <div class="table-buttons">
      {#if loadingMore}
        <Loading message="Loading more..." />
      {:else}
        <Button
          on:click={() => {
            if ($tableData?.data?.data?.docs) {
              loadingMore = true;
              $tableData.fetchMore($tableData.data.data.docs.length, 10).then(({ current, next, setStore }) => {
                if (current && next) {
                  const allDocs = [...(current.data?.docs || []), ...(next.data?.docs || [])];
                  setStore({ ...current, data: { totalDocs: current.data?.totalDocs || 0, docs: allDocs } });
                  loadingMore = false;
                }
              });
            }
          }}
        >
          Load more
        </Button>
      {/if}
    </div>
  {/if}
</div>

<div style="position: relative;">
  <BulkActions show={selectedIds.length > 0}>
    <Button on:click={() => (deleteDialogOpen = !deleteDialogOpen)}>
      <FluentIcon name="Delete20Regular" mode="buttonIconLeft" />
      Delete
    </Button>
    <Button on:click={() => (archiveDialogOpen = !archiveDialogOpen)}>
      <FluentIcon name="Delete20Regular" mode="buttonIconLeft" />
      Archive
    </Button>

    {#if collection.schemaName === 'File'}
      <Button
        href="{VITE_API_PROTOCOL}//{VITE_API_BASE_URL}/filestore/{$page.params.tenant}/{selectedIds[0]}"
        disabled={selectedIds.length !== 1}
        on:click={(evt) => {
          evt.preventDefault();
          window.open(
            `${VITE_API_PROTOCOL}//${VITE_API_BASE_URL}/filestore/${$page.params.tenant}/${selectedIds[0]}`,
            links.windowName + 'preview',
            'location=no'
          );
        }}
      >
        <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
        Open preview
      </Button>
    {:else}
      <Button
        on:click={() => {
          navigator.clipboard.writeText(`${$page.url.origin}${firstSelectedHref}`);
        }}
      >
        <FluentIcon name="Link20Regular" mode="buttonIconLeft" />
        Copy link
      </Button>
      <Button
        href={firstSelectedHref}
        disabled={selectedIds.length !== 1}
        on:click={(evt) => {
          evt.preventDefault();
          window.open(firstSelectedHref, links.windowName, 'location=no');
        }}
      >
        <FluentIcon name="Open20Regular" mode="buttonIconLeft" />
        Open in Editor
      </Button>
    {/if}
  </BulkActions>
</div>

<DeleteSelectedDocs
  bind:open={deleteDialogOpen}
  tenant={$page.params.tenant}
  byOne={collection.config?.data?.configuration?.collection?.by.one}
  {selectedIds}
  schemaName={collection.schemaName}
  handleSumbit={async () => {
    await $tableData.refetch();
  }}
/>

<ArchiveSelectedDocs
  bind:open={archiveDialogOpen}
  tenant={$page.params.tenant}
  byOne={collection.config?.data?.configuration?.collection?.by.one}
  {selectedIds}
  schemaName={collection.schemaName}
  handleSumbit={async () => {
    await $tableData.refetch();
  }}
/>

<style>
  div.wrapper {
    --border-color: var(--color-neutral-light-200)
    border: 1px solid var(--fds-divider-stroke-default);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius);
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  @media (prefers-color-scheme: dark) {
    div.wrapper {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  div[role='table'] {
    width: fit-content;
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    line-height: 20px;
  }

  

  /* row style */
  [role='row'] {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
  }
  a[role='row'] {
    text-decoration: none;
    color: inherit;
    cursor: default;
  }
  a[role='row']:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  a[role='row']:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  /* row size */
  div[role='rowgroup'] div[role="row"] {
    min-height: 40px;
    height: unset;
  }
  div[role='table'].compact div[role='rowgroup'] div[role="row"] {
    min-height: 30px;
    height: 30px;
  }

  /* header row */
  div[role='rowgroup'].thead div[role="row"] {
    border-bottom: 1px solid var(--border-color);
    min-height: 42px;
    height: 42px;
  }
  div[role='rowgroup'].thead {
    position:sticky;
    top: 0;
    background-color: #ffffff;
    z-index: 1;
  }
  @media (prefers-color-scheme: dark) {
    div[role='rowgroup'].thead {
      background-color: #272727;
    }
  }
  div[role='table'].compact div[role='rowgroup'].thead div[role="row"] {
    min-height: 36px;
  }

  /* cell */
  span[role='columnheader'], span[role='cell'] {
    padding: 4px 0 4px 10px;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  /* header sorting */
  span[role='columnheader'].sortable {
    position: relative;
    cursor: pointer;
  }
  span[role='columnheader'].sortable:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  span[role='columnheader'].sortable:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }
  .sort-chevron {
    position: absolute;
    top: 0;
    left: calc(var(--width) / 2 - 16px);
    width: 16px;
    height: 16px;
  }
  .sort-chevron > :global(svg) {
    fill: currentColor
  }
  
  /* disable text wrapping of cell content when compact mode is enabled */
  span[role='cell'] {
    overflow: hidden;
  }
  span.cell-content {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span.cell-content.noWrap {
    white-space: nowrap;
  }

  /* table load more button */
  .table-buttons {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 10px
  }
</style>
