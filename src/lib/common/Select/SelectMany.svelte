<script lang="ts">
  import { page } from '$app/stores';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { isObjectId } from '$utils/isObjectId';
  import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
  import { ComboBox, TextBox, TextBoxButton } from 'fluent-svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import type { Option } from '.';
  import SelectedOptions from './SelectedOptions.svelte';
  import { getReferenceOptions } from './getReferenceOptions';
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
  export let selectedOptions: Option[] = [];
  $: if (reference) {
    const valuesAreMissingLabels = selectedOptions.some((opt) => !opt.label);
    if (valuesAreMissingLabels) {
      populateReferenceValues(
        $page.params.tenant,
        selectedOptions,
        reference.collection,
        reference.fields
      ).then((options) => (selectedOptions = options));
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
  $: dispatch('change', selectedOptions);

  /**
   * The value inside the textbox that is displayed
   * when any value is allowed (instead of a set of options)
   */
  let textBoxValue = '';
  function handleTextKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') {
      addTextValues(textBoxValue);
      textBoxValue = '';
    }
    if (evt.key === 'Esc') {
      textBoxValue = '';
    }
  }
  function addTextValues(textValue: string) {
    if (textValue.includes(';')) {
      const currentKeys = selectedOptions.map((val) => val._id);
      const newKeys = Array.from(
        // put in set so duplicates are removed
        new Set(
          textValue
            .split(';')
            .map((value) => value.trim())
            // prevent keys that already exist in `currentKeys`
            .filter((newKey) => currentKeys.every((currentKey) => currentKey !== newKey))
        )
      );

      selectedOptions = [...selectedOptions, ...newKeys.map((value) => ({ label: value, _id: value }))];
    } else if (textValue.includes(',')) {
      const currentKeys = selectedOptions.map((val) => val._id);
      const newKeys = Array.from(
        // put in set so duplicates are removed
        new Set(
          textValue
            .split(',')
            .map((value) => value.trim())
            // prevent keys that already exist in `currentKeys`
            .filter((newKey) => currentKeys.every((currentKey) => currentKey !== newKey))
        )
      );

      selectedOptions = [...selectedOptions, ...newKeys.map((value) => ({ label: value, _id: value }))];
    } else {
      selectedOptions = [...selectedOptions, { label: textValue, _id: textValue }];
    }
  }

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

<!--
@component
Creates a multi-select dropdown/combobox.

The `on:change` event occurs when the text input changes.
The `on:select` event occurs when the selected values change. It fires upon selection and deselection.
-->

<!-- When a reference is provided, we search from reference docs to generate the options -->
{#if reference}
  {@const filteredReferenceItems = $referenceOptions
    .filter((opt) => !selectedOptions.map(({ _id }) => _id).includes(opt._id))
    .map(toComboboxOption)}
  {@const filteredOptionsItems = options
    ?.filter((opt) => !selectedOptions.map(({ _id }) => _id).includes(opt._id))
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

        // if the value is already selected, do not add it to the list of selected values
        if (selectedOptions.find(({ _id }) => evt.detail.value === _id)) return;

        // otherwise, add it to the list
        selectedOptions = [
          ...selectedOptions,
          { label: evt.detail.name, _id: evt.detail.value, disabled: evt.detail.disabled },
        ];

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
  {@const filteredItems = options
    .filter((opt) => !selectedOptions.map(({ _id }) => _id).includes(opt._id))
    .map(toComboboxOption)}
  {#key filteredItems}
    <ComboBox
      items={filteredItems}
      {disabled}
      on:select={(evt) => {
        if (!evt.detail) return;

        // if the value is already selected, do not add it to the list of selected values
        if (selectedOptions.find(({ _id }) => evt.detail.value === _id)) return;

        // otherwise, add it to the list
        selectedOptions = [
          ...selectedOptions,
          { label: evt.detail.name, _id: evt.detail.value, disabled: evt.detail.disabled },
        ];
      }}
    />
  {/key}
{:else}
  <TextBox
    placeholder="Type a value and then click the arrow"
    bind:value={textBoxValue}
    on:keydown={handleTextKeyDown}
    {disabled}
  >
    <svelte:fragment slot="buttons">
      <TextBoxButton>
        <FluentIcon name="ArrowRight12Regular" />
      </TextBoxButton>
    </svelte:fragment>
  </TextBox>
{/if}

<SelectedOptions bind:selectedOptions {disabled} {reference} {options} hideIds />

<style>
  :global(.combobox-cristata) {
    width: 100%;
  }
</style>
