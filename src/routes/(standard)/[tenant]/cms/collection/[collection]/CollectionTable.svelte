<script lang="ts">
  import { compactMode } from '$stores/compactMode';
  import type { SchemaDef as AppSchemaDef } from '@jackbuehner/cristata-generator-schema';
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import {
    createSvelteTable,
    flexRender,
    getCoreRowModel,
    renderComponent,
    type ColumnDef,
    type TableOptions,
  } from '@tanstack/svelte-table';
  import { Checkbox } from 'fluent-svelte';
  import { writable } from 'svelte/store';
  import type { PageData } from './$types';
  import ValueCell from './ValueCell.svelte';

  export let collection: NonNullable<PageData['collection']>;
  export let schema: NonNullable<PageData['table']>['schema'];
  export let tableData: NonNullable<PageData['table']>['data'];

  interface SchemaDef extends AppSchemaDef {
    docs?: undefined;
  }

  let columns: ColumnDef<unknown>[] = [];
  $: columns = [
    {
      accessorKey: '__checkbox',
      cell: (info) => {
        return renderComponent(ValueCell, { info, type: 'checkbox' });
      },
      size: 32,
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
      .map(([key, def]): ColumnDef<unknown> | null => {
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
            header: () => def.column?.label || key,
            size: parseInt(`${def.column.width}`) || 150,
            cell: (info) => renderComponent(ValueCell, { info, key, def }),
            enableSorting: def.column.sortable || false,
          };
        }
        return {
          accessorKey: key,
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
      cell: (info) =>
        renderComponent(ValueCell, { info, key: 'people.created_by', def: { type: ['User', 'ObjectId'] } }),
      size: 150,
      enableSorting: false,
    },
    {
      header: 'Last modified by',
      accessorKey: 'people.last_modified_by',
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
      cell: (info) =>
        renderComponent(ValueCell, { info, key: 'timestamps.modified_at', def: { type: 'Date' } }),
      size: 190,
      enableSorting: true,
    },
  ];

  let colName = collection.colName;
  let data: unknown[] = [];
  $: {
    if (data.length !== ($tableData?.data?.data?.docs || []).length || colName !== collection.colName) {
      data = $tableData?.data?.data?.docs || [];
      colName = collection.colName;
    }
  }

  $: options = writable<TableOptions<unknown>>({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    debugAll: true,
    meta: {
      compactMode: $compactMode,
      noWrap: $compactMode,
    },
  });

  $: table = createSvelteTable(options);

  let selectedIds: string[] = [];
</script>

<div class="wrapper">
  <div role="table" class:compact={$table.options.meta?.compactMode}>
    <div role="rowgroup" class="thead">
      {#each $table.getHeaderGroups() as headerGroup}
        <div role="row">
          {#each headerGroup.headers as header}
            <span role="columnheader" style="width: {header.getSize()}px;">
              {#if header.id === '__checkbox'}
                <Checkbox checked={selectedIds.length === $table.getRowModel().rows.length} />
              {:else if !header.isPlaceholder}
                <svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
              {/if}
            </span>
          {/each}
        </div>
      {/each}
    </div>
    <div role="rowgroup" class="tbody">
      {#each $table.getRowModel().rows as row}
        <div role="row">
          {#each row.getVisibleCells() as cell}
            <span role="cell" style="width: {cell.column.getSize()}px;">
              {#if cell.column.id === '__checkbox'}
                <Checkbox />
              {:else}
                <span class="cell-content" class:noWrap={$table.options.meta?.noWrap}>
                  <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
                </span>
              {/if}
            </span>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

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

  

  div[role='row'] {
    /* border: 1px solid blue; */
    

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
  }

  /* rows */
  div[role='rowgroup'] div[role="row"] {
    min-height: 40px;
    height: unset;
  }
  div[role='table'].compact div[role='rowgroup'] div[role="row"] {
    min-height: 30px;
    height: 30px;
  }

  /* header row */
  div[role='rowgroup'].thead div[role="row"], div[role='table'].compact div[role='rowgroup'].thead div[role="row"] {
    border-bottom: 1px solid var(--border-color);
    min-height: 34px;
  }

  /* cell */
  span[role='columnheader'], span[role='cell'] {
    padding: 4px 0 4px 10px;
    box-sizing: border-box;
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

  /* make the checkboxes smaller */
  div[role='table'] :global(.checkbox-container),
  div[role='table'] :global(.checkbox) {
    --size: 18px;
    min-block-size: var(--size);
    block-size: var(--size);
    inline-size: var(--size);
    display: block;
  }
  div[role='table'].compact :global(.checkbox-container),
  div[role='table'].compact :global(.checkbox) {
    --size: 16px;
  }
</style>
