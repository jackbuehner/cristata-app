<script lang="ts">
  import { page } from '$app/stores';
  import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
  import { slugify } from '@jackbuehner/cristata-utils';
  import { Button } from 'fluent-svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import type { Option } from '.';
  import Loading from '../Loading.svelte';
  import SelectedOption from './SelectedOption.svelte';
  import { handleOpenReference } from './handleOpenReference';

  export let selectedOptions: Option[] = [];
  export let disabled = false;
  export let reference: (FieldDef['reference'] & { collection: string }) | undefined = undefined;
  export let options: Option[] | undefined = undefined;
  export let hideIds = false;
  export let populating = false;

  $: (() => {
    const unique: Option[] = [];
    selectedOptions.forEach((value) => {
      if (!unique.map(({ _id }) => _id).includes(value._id)) unique.push(value);
    });
    if (selectedOptions.length !== unique.length) selectedOptions = [...unique];
  })();

  const dispatch = createEventDispatcher<{
    dismiss: Option[];
    dismissall: Option[];
    dragfinalize: Option[];
    dragconsider: Option[];
  }>();

  const flipDurationMs = 200;
  let dragging = false;
  function handleDndConsider(evt: CustomEvent<DndEvent<Option>>) {
    // Ensure dragging is stopped on drag finish via keyboard
    if (evt.detail.info.source === SOURCES.KEYBOARD && evt.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
      dragging = false;
    }
    // update the options
    selectedOptions = evt.detail.items;
    dispatch('dragconsider', evt.detail.items);
  }
  function handleDndFinalize(evt: CustomEvent<DndEvent<Option>>) {
    // Ensure dragging is stopped on drag finish via pointer (mouse, touch)
    if (evt.detail.info.source === SOURCES.POINTER) {
      dragging = false;
    }
    // update the options
    selectedOptions = evt.detail.items;
    dispatch('dragfinalize', evt.detail.items);
  }
  function startDrag(evt: Event) {
    // preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
    evt.preventDefault();
    dragging = true;
  }
  function handleKeyDown(evt: KeyboardEvent) {
    if ((evt.key === 'Enter' || evt.key === ' ') && !dragging) dragging = true;
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

  // do not update whether the clear all button is shown when a drag
  // operation that could affect the options is in progress
  let showClearAll = selectedOptions.length > 0;
  $: if (!isPendingDropLocation) showClearAll = selectedOptions.length > 0;
</script>

{#if showClearAll || populating}
  <div class="selection-actions">
    {#if showClearAll}
      <Button
        on:click={() => {
          if (disabled || populating) return;
          selectedOptions = [];
          dispatch('dismissall', selectedOptions);
        }}
        disabled={disabled || populating}
      >
        Clear all
      </Button>
    {/if}
    {#if populating}
      <Loading message="Populating values..." />
    {/if}
  </div>
{/if}

<div
  bind:this={selectedListElement}
  class="selected-list"
  use:dndzone={{
    items: selectedOptions,
    dragDisabled: disabled || !dragging,
    flipDurationMs,
    dropTargetStyle: {},
    dropTargetClasses: ['can-drop-here'],
    type: (() => {
      if (reference)
        return slugify(`select-many.reference.${JSON.stringify({ ...reference, forceLoadFields: [] })}`);
      if (options) return slugify(`select-many.options.${JSON.stringify(options)}`);
      return 'select-many.any-text';
    })(),
    dropFromOthersDisabled: disabled || populating,
  }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each selectedOptions as { label, _id } (_id)}
    <div animate:flip={{ duration: flipDurationMs }}>
      <SelectedOption
        {label}
        {_id}
        disabled={disabled || populating}
        on:keydown={handleKeyDown}
        on:focus={() => (dragging = true)}
        on:blur={() => (dragging = false)}
        on:mousedown={(evt) => evt.preventDefault()}
        on:touchstart={(evt) => evt.preventDefault()}
        on:startdrag={(evt) => startDrag(evt.detail)}
        on:dismiss={() => {
          selectedOptions = selectedOptions.filter((value) => value._id !== _id);
          dispatch('dismiss', selectedOptions);
        }}
        draggable
        {dragging}
        openable={!!reference}
        on:open={() => {
          if (_id && reference && $page.params.tenant) {
            handleOpenReference(_id, reference, $page.params.tenant);
          }
        }}
        hideId={hideIds}
      />
    </div>
  {/each}
</div>

<style>
  .selection-actions {
    display: flex;
    flex-direction: row;
    padding: 12px 0 0 0;
    gap: 10px;
  }

  .selected-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .selected-list:global(.can-drop-here) {
    border-radius: var(--fds-control-corner-radius);
    outline: 2px solid var(--fds-accent-default);
    min-height: 62px;
  }
</style>
