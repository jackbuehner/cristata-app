<script lang="ts">
  import { Chip } from '$lib/common/Chip';
  import { formatISODate } from '$utils/formatISODate';
  import { genAvatar } from '$utils/genAvatar';
  import { getProperty } from '$utils/objectPath';
  import { isTypeTuple, type SchemaDef } from '@jackbuehner/cristata-generator-schema';
  import type { CellContext } from '@tanstack/svelte-table';

  export let info: CellContext<any, unknown>;
  export let type: 'string' | 'checkbox' = 'string';
  export let key: string;
  export let def: SchemaDef;

  const fieldData = info.getValue() || '';
</script>

{#if type === 'checkbox'}
  __checkbox
{:else if def.column?.reference?.collection || isTypeTuple(def.type)}
  {@const collection = isTypeTuple(def.type)
    ? def.type[0].replace('[', '').replace(']', '')
    : def.field?.reference?.collection || ''}

  {@const refData = Array.isArray(fieldData) ? fieldData : [fieldData]}
  {@const refDataWithStandardKeys = refData.map((data) => {
    return {
      _id: getProperty(data, def.column?.reference?.fields?._id || '_id'),
      name: getProperty(data, def.column?.reference?.fields?.name || 'name'),
      photo: getProperty(data, 'photo'),
    };
  })}
  <div class="refs-wrapper" class:compact={info.table.options.meta?.compactMode}>
    {#if collection === 'User' && info.table.options.meta?.compactMode}
      {#each refDataWithStandardKeys as data}
        {@const _id = data._id ? `${data._id}` : undefined}
        {@const photo = data.photo ? `${data.photo}` : undefined}
        <img
          src={photo ? photo : _id ? genAvatar(_id) : ''}
          alt=""
          style="width: 20px; height: 20px; border-radius: 50%;"
        />
      {/each}
    {/if}
    {#each refDataWithStandardKeys as data, index}
      {@const name = data.name ? `${data.name}` : undefined}
      {@const _id = data._id ? `${data._id}` : undefined}
      {@const photo = data.photo ? `${data.photo}` : undefined}
      <div class="ref-wrapper">
        {#if collection === 'User' && !info.table.options.meta?.compactMode}
          <img
            src={photo ? photo : _id ? genAvatar(_id) : ''}
            alt=""
            style="width: 20px; height: 20px; border-radius: 50%;"
          />
        {/if}
        {#if info.table.options.meta?.compactMode && index < refDataWithStandardKeys.length - 1}
          <span>{name || _id}, </span>
        {:else}
          <span>{name || _id}</span>
        {/if}
      </div>
    {/each}
  </div>
{:else if Array.isArray(fieldData)}
  <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
    {#each fieldData as entry}
      {@const stringValue = (() => {
        try {
          return entry.toString();
        } catch {
          return JSON.stringify(entry);
        }
      })()}
      {#if def.column?.chips}
        {#if typeof def.column.chips === 'boolean'}
          <Chip color="neutral" data-value={stringValue}>{stringValue}</Chip>
        {:else}
          {@const match = def.column.chips.find((s) => s.value === stringValue)}
          <Chip color={match?.color || 'neutral'} data-value={stringValue}>
            {match?.label || stringValue}
          </Chip>
        {/if}
      {:else}
        {stringValue}
      {/if}
    {/each}
  </div>
{:else if typeof fieldData === 'string'}
  <!-- DATE FIELDS -->
  {#if def.type === 'Date'}
    <!-- this is the default date -->
    {#if fieldData === '0001-01-01T01:00:00.000+00:00' || fieldData === '0001-01-01T01:00:00.000Z'}
      {''}
    {:else}
      {formatISODate(fieldData, false, true, true)}
    {/if}
    <!-- CHIPS -->
  {:else if def.column?.chips}
    {#if typeof def.column.chips === 'boolean'}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={'neutral'} data-value={fieldData}>
          {fieldData}
        </Chip>
      </div>
    {:else}
      {@const match = def.column.chips.find((s) => s.value === fieldData)}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={match?.color || 'neutral'} data-value={fieldData}>
          {match?.label || fieldData}
        </Chip>
      </div>
    {/if}
  {:else}
    {fieldData}
  {/if}
{:else if typeof fieldData === 'number'}
  {#if def.column?.chips}
    {#if typeof def.column.chips === 'boolean'}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={'neutral'} data-value={fieldData}>
          {fieldData}
        </Chip>
      </div>
    {:else}
      {@const match = def.column.chips.find((s) => s.value === fieldData)}
      <div class="chips-wrapper" class:compact={info.table.options.meta?.compactMode}>
        <Chip color={match?.color || 'neutral'} data-value={fieldData}>
          {match?.label || fieldData}
        </Chip>
      </div>
    {/if}
  {:else}
    {fieldData}
  {/if}
{:else}
  <!-- 

  OBJECTS AND ARRAYS
  
  -->
  {JSON.stringify(fieldData)}
{/if}

<style>
  .chips-wrapper {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin: 2px 0;
    flex-wrap: wrap;
  }

  .chips-wrapper.compact {
    flex-wrap: nowrap;
    gap: 3px;
  }

  .refs-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 2px 0;
  }

  .refs-wrapper.compact {
    flex-direction: row;
  }

  .ref-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
