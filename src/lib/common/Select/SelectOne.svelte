<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { isObjectId } from '$utils/isObjectId';
  import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
  import { ComboBox, TextBox, TextBoxButton } from 'fluent-svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import type { Option } from '.';
  import SelectedOption from './SelectedOption.svelte';
  import { getReferenceOptions } from './getReferenceOptions';
  import { handleOpenReference } from './handleOpenReference';
  import { populateReferenceValues } from './populateReferenceValues';

  export let options: Option[] | undefined = undefined;

  /**
   * Disables the field.
   */
  export let disabled = false;

  /**
   * The current values that are selected.
   *
   * If a value is provided without a label and there is a reference definition
   * provided, the component will attempt to populate the label.
   */
  export let selectedOption: Option | null = null;
  $: if (reference && selectedOption) {
    const valueIsMissingLabels = !selectedOption.label;
    if (valueIsMissingLabels) {
      populateReferenceValues(
        $page.params.tenant,
        [selectedOption],
        reference.collection,
        reference.fields
      ).then((options) => (selectedOption = options[0]));
    }
  }

  /**
   * The reference definition for a referenced collection.
   *
   * If provided, the component will search the specified collection for matches.
   */
  export let reference: (FieldDef['reference'] & { collection: string }) | undefined = undefined;

  // expose changes to selected options via change event
  const dispatch = createEventDispatcher();
  $: dispatch('change', selectedOption);

  /**
   * Takes the `selectedOptions` array and converts it to an array of objects
   * accepted by the ComboBox component.
   */
  function toComboboxOption(opt: Option) {
    return {
      name: opt.label || opt._id,
      value: opt._id,
      disabled: opt.disabled,
      errorMessage: opt.reason,
      identifier: isObjectId(opt._id)
        ? opt._id.slice(-7, opt._id.length)
        : typeof opt._id === 'number' && `${opt._id}`.length < 4
        ? `${opt._id}`
        : undefined,
    };
  }

  const {
    searchValue,
    options: referenceOptions,
    loading,
  } = getReferenceOptions($page.params.tenant, reference);
  let referenceComboBoxWrapperElement: HTMLDivElement;
  let referenceComboBoxOpen = false;
  let referenceComboBoxValue = '';
</script>

{#if selectedOption}
  <SelectedOption
    _id={selectedOption._id}
    label={selectedOption.label}
    {disabled}
    on:dismiss={() => {
      selectedOption = null;
    }}
    openable={!!reference}
    on:open={() => {
      if (selectedOption?._id && reference && $page.params.tenant) {
        handleOpenReference(selectedOption._id, reference, $page.params.tenant);
      }
    }}
  />
{:else if reference}
  {@const filteredReferenceItems = $referenceOptions
    .filter((opt) => opt._id !== selectedOption?._id)
    .map(toComboboxOption)}
  {@const filteredOptionsItems = options
    ?.filter((opt) => opt._id !== selectedOption?._id)
    .map(toComboboxOption)}
  <div
    bind:this={referenceComboBoxWrapperElement}
    on:focusin={() => {
      const hasFocusedChild = referenceComboBoxWrapperElement.matches(':focus-within:not(:focus)');
      if (hasFocusedChild) referenceComboBoxOpen = true;
    }}
    on:focusout={() => {
      const hasFocusedChild = referenceComboBoxWrapperElement.matches(':focus-within:not(:focus)');
      if (!hasFocusedChild) referenceComboBoxOpen = false;
    }}
  >
    <ComboBox
      bind:open={referenceComboBoxOpen}
      bind:value={referenceComboBoxValue}
      class="combobox-cristata"
      items={$loading || !$searchValue ? [] : [...filteredReferenceItems, ...(filteredOptionsItems || [])]}
      editable
      disableAutoSelectFromSearch
      {disabled}
      noItemsMessage={$loading
        ? 'Loading options...'
        : !!$searchValue
        ? 'No matches were found'
        : 'Start typing to view options'}
      bind:searchValue={$searchValue}
      on:input={() => {
        referenceComboBoxOpen = true;
      }}
      openOnFocus
      placeholder="Select..."
      on:select={(evt) => {
        if (!evt.detail) return;

        // otherwise, add it to the list
        selectedOption = { label: evt.detail.name, _id: evt.detail.value, disabled: evt.detail.disabled };

        // clear the value of the combobox so that the most recently selected item can be removed from the list
        // (the component will re-select the best match based on the value)
        tick().then(() => {
          // we cannot use an empty string because the component does not act on falsy values
          referenceComboBoxValue = '__internal_empty__';
        });
      }}
    />
  </div>
  <!-- When options are provided, we allow selecting from the provided options -->
{:else if options}
  {@const filteredItems = options.filter((opt) => opt._id !== selectedOption?._id).map(toComboboxOption)}
  {#key filteredItems}
    <ComboBox
      items={filteredItems}
      {disabled}
      on:select={(evt) => {
        if (!evt.detail) return;

        // otherwise, add it to the list
        selectedOption = { label: evt.detail.name, _id: evt.detail.value, disabled: evt.detail.disabled };
      }}
    />
  {/key}
{/if}

<style>
  :global(.combobox-cristata) {
    width: 100%;
  }
</style>
