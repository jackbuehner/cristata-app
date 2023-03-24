<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { StatelessCheckbox } from '$lib/common/Checkbox';
  import Loading from '$lib/common/Loading.svelte';
  import { compactMode } from '$stores/compactMode';
  import { motionMode } from '$stores/motionMode';
  import { hasKey } from '$utils/hasKey';
  import type { SchemaDef as AppSchemaDef } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import {
    createSvelteTable,
    getCoreRowModel,
    renderComponent,
    type ColumnDef,
    type Row,
    type TableOptions,
  } from '@tanstack/svelte-table';
  import { Button } from 'fluent-svelte';
  import { createEventDispatcher } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';
  import BulkActions from './BulkActions.svelte';
  import { selectedIds } from './selectedIdsStore';
  import ValueCell from './ValueCell.svelte';

  export let collection: NonNullable<PageData['collection']>;
  export let schema: NonNullable<PageData['table']>['schema'];
  export let tableData: NonNullable<PageData['table']>['data'];
  export let tableDataFilter: NonNullable<PageData['table']>['filter'];
  export let tableDataSort: NonNullable<PageData['table']>['sort'];
  /**
   * A template string for the thumbnail.
   *
   * `{{_id}}` inside the template string will be replaced with the `_id` of the document
   */
  export let photoTemplate: string;

  interface SchemaDef extends AppSchemaDef {
    docs?: undefined;
  }

  const oneAccessor = collection.config?.data?.configuration?.collection?.by.one;

  type Doc = NonNullable<NonNullable<NonNullable<typeof $tableData.data>['data']>['docs']>[0];

  // if the field is a body field that is rendered as a tiptap editor,
  // we want to open it in maximized mode for easy access to the editor
  const shouldOpenMaximized = !!schema.find(([key, def]) => key === 'body' && def.field?.tiptap);

  // row links behaviors
  const links = {
    href: `/${$page.params.tenant}/cms/collection/${$page.params.collection}`,
    hrefSuffixKey: collection.config?.data?.configuration?.collection?.by?.one || '_id',
    hrefSearch: shouldOpenMaximized ? '?fs=1&props=1' : undefined,
    windowName: `editor-${$page.params.tenant}-${collection.schemaName}-`,
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
        const [key] = x;

        return key === 'name' || key === 'tags';
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
      .filter(notEmpty) || []),
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
    debugAll: false,
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

  function handleRowClick(evt: PointerEvent | MouseEvent, row: Row<Doc>) {
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
  $: $selectedIds = $table
    .getSelectedRowModel()
    .rows.map(
      (row) => row.original[collection.config?.data?.configuration?.collection?.by.one || '_id']
    ) as string[];

  export let loadingMore = false;
</script>

<div class="wrapper">
  <div class="grid" class:compact={$table.options.meta?.compactMode}>
    {#each $table.getRowModel().rows as row, i}
      {@const href = `${links.href}/${row.original?.[links.hrefSuffixKey]}${links.hrefSearch || ''}`}
      {@const photoHref = photoTemplate.replace('{{_id}}', row.original[oneAccessor || '_id'])}
      {#key href}
        <a
          {href}
          on:click={(evt) => handleRowClick(evt, row)}
          on:dblclick={(evt) => {
            if (!isInputElem(evt.target) && !isCheckbox(evt.target)) goto(href);
          }}
          in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}
        >
          <div class="photo" style={`--photoUrl: url(${photoHref})`} />
          <StatelessCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            size={$compactMode ? 16 : 18}
            labelStyle="
              position: absolute;
              top: 10px;
              left: 10px;
              background: white;
              border-radius: var(--fds-control-corner-radius);
              display: {row.getIsSelected() ? 'block' : 'none'};
            "
            on:click={(evt) => {
              evt.stopPropagation();
            }}
            on:change={(evt) => {
              row.toggleSelected(evt.detail.checked);
              lastSelectedRowIndex = row.index;
            }}
          />
          <div class="name" class:compact={$table.options.meta?.compactMode} title={row.getValue('name')}>
            {row.getValue('name')}
          </div>
        </a>
      {/key}
    {/each}
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

{#if collection.config?.data?.configuration?.collection}
  <div style="position: relative;">
    <BulkActions
      collection={collection.config.data.configuration.collection}
      {tableData}
      {shouldOpenMaximized}
    />
  </div>
{/if}

<style>
  div.wrapper {
    --border-color: var(--color-neutral-light-200)
    border: 1px solid var(--fds-divider-stroke-default);
    box-shadow: 0 0 0 1px var(--border-color);
    border-radius: var(--fds-control-corner-radius);
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;
  }

  @media (prefers-color-scheme: dark) {
    div.wrapper {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  div.grid {
    width: fit-content;
    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    line-height: 20px;

    display: grid;
    grid-template-columns: repeat(auto-fill, 130px);
    grid-auto-rows: min-content;
    justify-content: space-between;
    align-items: start;
    gap: 10px;
    width: 100%;
  }
  div.grid.compact {
    gap: 4px;
    grid-template-columns: repeat(auto-fill, 110px);
  }

  a {
    display: flex;
    position: relative;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    padding: 5px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-radius: var(--fds-control-corner-radius);
  }
  a:hover {
    background-color: var(--fds-subtle-fill-secondary);
  }
  a:active {
    background-color: var(--fds-subtle-fill-tertiary);
    color: var(--fds-text-secondary);
  }

  a:hover :global(.checkbox-container) {
    display: block !important;
  }

  div.name {
    font-size: 13.5px;
    line-height: 1.3;
    padding-top: 5px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    user-select: none;
  }
  div.name.compact {
    font-size: 13px;
    -webkit-line-clamp: 3;
  }

  div.photo {
    display: flex;
    flex-shrink: 0;
    width: 100%;
    aspect-ratio: 1.4 / 1;
    background-image: var(--photoUrl);
    background-size: contain;
    background-position: bottom;
    background-repeat: no-repeat;
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
