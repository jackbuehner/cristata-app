<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { getProperty } from '$utils/objectPath';
  import { slugify } from '@jackbuehner/cristata-utils';
  import { copy } from 'copy-anything';
  import { Button } from 'fluent-svelte';
  import { merge } from 'merge-anything';
  import { createEventDispatcher, onMount, tick, type ComponentProps } from 'svelte';
  import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action';
  import { v4 as uuidv4 } from 'uuid';
  import { SchemaField } from '../Field';
  import Item from './Item.svelte';

  export let schemaFieldParams: ComponentProps<SchemaField>;
  $: ({
    key,
    def,
    mode,
    ydoc,
    wsProvider,
    disabled,
    user,
    processSchemaDef,
    coreSidebarProps,
    fullSharedData,
    dynamicPreviewHref,
    style,
  } = schemaFieldParams);
  export let ydocKey: string = '';

  type YArr = Record<string, unknown> & { __uuid: string; _id: string };
  type ParentYArr = Record<string, unknown> & { __uuid: string };
  export let arr: YArr[] = [];

  $: groupFields = processSchemaDef?.({ schemaDef: (def.docs || []).filter(([key]) => !key.includes('.#')) });

  function addDoc() {
    const keysToAdd = (groupFields || []).map(([key, def]) => key.replace(ydocKey + '.', ''));

    const __uuid = uuidv4();
    const newEmptyDoc: YArr = merge(
      { __uuid: __uuid, _id: __uuid },
      ...keysToAdd.map((key) => ({ [key]: undefined }))
    );

    dispatch('add', [...arr, newEmptyDoc]);
  }

  const dispatch = createEventDispatcher<{
    dismiss: ParentYArr[];
    dismissall: ParentYArr[];
    dragfinalize: ParentYArr[];
    dragconsider: ParentYArr[];
    add: ParentYArr[];
  }>();

  const flipDurationMs = 200;
  let dragging = false;
  function handleDndConsider(evt: CustomEvent<DndEvent<YArr>>) {
    // Ensure dragging is stopped on drag finish via keyboard
    if (evt.detail.info.source === SOURCES.KEYBOARD && evt.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
      dragging = false;
    }
    // update the options
    arr = evt.detail.items;
    dispatch(
      'dragconsider',
      evt.detail.items.map(({ _id, ...rest }) => rest)
    );
  }
  function handleDndFinalize(evt: CustomEvent<DndEvent<YArr>>) {
    // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
    if (evt.detail.info.source === SOURCES.POINTER) {
      dragging = false;
    }
    // update the options
    arr = evt.detail.items;
    dispatch('dragfinalize', evt.detail.items);
  }
  function startDrag(evt: Event) {
    // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
    evt.preventDefault();
    dragging = true;
  }
  function stopDrag(evt: Event) {
    evt.preventDefault();
    dragging = false;
  }
  function handleKeyDown(evt: KeyboardEvent) {
    if (
      (evt.key === 'Enter' || evt.key === ' ') &&
      (evt.target as HTMLElement | null)?.classList.contains('doc-array-item')
    ) {
      evt.preventDefault();
      if (!dragging) {
        dragging = true;
        tick().then(() => {
          (evt.target as HTMLElement | null)?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        });
      }
    }
  }

  // Keep track of whether the area is marked as a valid drop location
  let selectedListElement: HTMLDivElement;
  let isPendingDropLocation = false;
  onMount(() => {
    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mu) => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return;

        const classList = (mu.target as HTMLDivElement).classList;
        if (classList && Array.from(classList).includes('can-drop-here')) isPendingDropLocation = true;
        else isPendingDropLocation = false;
      });
    });

    attrObserver.observe(selectedListElement, { attributes: true });
  });

  function handleCollapse(evt: CustomEvent<boolean>, index: number) {
    if (!disabled) {
      const yarray = $ydoc?.getArray<ParentYArr>(ydocKey);
      $ydoc?.transact(() => {
        yarray?.delete(index); // remove existing value
        yarray?.insert(index, [{ ...arr[index], __collapsed: evt.detail }]); // add the value back but not collapse
      });
    }
  }
</script>

<div
  bind:this={selectedListElement}
  class="doc-array-list"
  use:dndzone={{
    items: arr,
    dragDisabled: disabled || !dragging,
    flipDurationMs,
    dropTargetStyle: {},
    dropTargetClasses: ['can-drop-here'],
    type: slugify(`doc-array.${ydocKey}`),
    dropFromOthersDisabled: true,
  }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each arr as { _id }, index (_id)}
    {@const collapsed = getProperty(arr, `${index}.__collapsed`) === true}
    <Item
      on:keydown={handleKeyDown}
      on:startdrag={(evt) => startDrag(evt.detail)}
      on:stopdrag={(evt) => stopDrag(evt.detail)}
      on:dismiss={() => {
        const newArr = arr.filter((value) => value._id !== _id);
        dispatch('dismiss', newArr);
      }}
      draggable
      {dragging}
      {disabled}
      {collapsed}
      on:collapse={(evt) => {
        handleCollapse(evt, index);
      }}
    >
      {#if collapsed}
        {#each groupFields || [] as [subkey, subdef]}
          {@const data = arr?.[index]}
          {@const detailData = getProperty(data, subkey.replace(`${ydocKey}.`, ''))}
          <div class="doc-array-item-detail-grid">
            <span style="color: var(--fds-text-secondary);">{subdef.field?.label || subkey}</span>
            <span class="doc-array-item-detail-data">
              {#if Array.isArray(detailData)}
                {detailData.length} items
              {:else}
                {detailData}
              {/if}
            </span>
          </div>
        {/each}
      {:else}
        {#each groupFields || [] as [subkey, subdef]}
          <SchemaField
            key={subkey.replace(ydocKey, `${ydocKey}`)}
            def={subdef}
            {mode}
            {ydoc}
            {wsProvider}
            {disabled}
            {user}
            {processSchemaDef}
            {coreSidebarProps}
            {fullSharedData}
            {dynamicPreviewHref}
            {style}
            yjsDocArrayConfig={// doc array options for yjs
            {
              __uuid: _id, // identify sub fields by uuid
              parentKey: ydocKey, // the key of the doc array that contains the doc
              childKey: subkey.replace(ydocKey + '.', ''),
            }}
          />
        {/each}
      {/if}
    </Item>
  {/each}
</div>

<div class="doc-array-actions">
  <Button on:click={addDoc} {disabled}>
    <FluentIcon name="Add16Regular" mode="buttonIconLeft" />
    Add document
  </Button>
</div>

<style>
  .doc-array-actions {
    display: flex;
    flex-direction: row;
    padding: 6px 0 0 0;
  }

  .doc-array-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .doc-array-list:global(.can-drop-here) {
    border-radius: var(--fds-control-corner-radius);
    outline: 2px solid var(--fds-accent-default);
    min-height: 62px;
  }

  .doc-array-item-detail-grid {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 2px 0px;
    font-size: 13px;
    line-height: 16px;
    font-family: var(--fds-font-family-text);
  }

  .doc-array-item-detail-data {
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
