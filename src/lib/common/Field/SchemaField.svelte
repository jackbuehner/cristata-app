<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { StatelessCheckbox } from '$lib/common/Checkbox';
  import { DateTime } from '$lib/common/DateTime';
  import { SelectMany, SelectOne } from '$lib/common/Select';
  import { NumberTiptap, RichTiptap, TextTiptap } from '$lib/common/Tiptap';
  import type { AwarenessUser, YStore } from '$utils/createYStore';
  import { isTypeTuple, type DeconstructedSchemaDefType } from '@jackbuehner/cristata-generator-schema';
  import type { ComponentProps } from 'svelte';
  import { FieldWrapper } from '.';
  import type { ProcessSchemaDef } from '../../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/+layout';
  import type Sidebar from '../../../routes/(standard)/[tenant]/cms/collection/[collection]/[item_id]/Sidebar.svelte';

  export let key: DeconstructedSchemaDefType[0][0];
  export let def: DeconstructedSchemaDefType[0][1];
  export let mode: 'editor' | 'publish' | 'create' | 'sidebar' = 'editor';
  export let ydoc: YStore['ydoc'];
  export let wsProvider: YStore['wsProvider'];
  export let disabled = false;
  export let user: AwarenessUser;
  export let processSchemaDef: ProcessSchemaDef | undefined = undefined;
  export let coreSidebarProps: ComponentProps<Sidebar> | undefined = undefined;

  $: type = isTypeTuple(def.type) ? def.type[1] : def.type;
  $: isArrayType =
    (isTypeTuple(def.type) && Array.isArray(def.type[1])) ||
    (!isTypeTuple(def.type) && Array.isArray(def.type));

  $: readOnly =
    def.field?.readonly === true || def.type === 'DocArray'
      ? def.docs?.[0]?.[1]?.modifiable !== true
      : def.modifiable !== true;

  $: fieldName = (() => {
    let fieldName = def.field?.label || key;

    // if a field is readonly, add readonly to the field name
    if (readOnly) fieldName += ' (read only)';

    return fieldName;
  })();

  $: description = def.field?.description;

  // disable the field if the disabled prop is provided OR it is readonly
  $: _disabled = disabled || readOnly;

  $: ydocKey = key;

  // process the options to be ready for SelectOne/SelectMany, if available/applicable
  $: options = def.field?.options?.map((opt) => {
    return {
      label: opt.label,
      _id: opt.value.toString(),
      disabled: opt.disabled,
    };
  });

  //
  $: fullscreen =
    $page.url.searchParams.get('fs') === '1' ||
    $page.url.searchParams.get('fs') === '3' ||
    $page.url.searchParams.get('fs') === 'force';
  afterNavigate(() => {
    fullscreen =
      new URL(window.location.href).searchParams.get('fs') === '1' ||
      new URL(window.location.href).searchParams.get('fs') === '3' ||
      $page.url.searchParams.get('fs') === 'force';
  });
</script>

{#if key === 'body' && def.field?.tiptap}
  {#if mode === 'sidebar'}
    <!-- hide field so it is not rendered in a sidebar, which would create infinite nesting -->
  {:else if !!$ydoc && !!$wsProvider}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <RichTiptap
        {disabled}
        {ydoc}
        {ydocKey}
        {wsProvider}
        {user}
        options={def.field.tiptap}
        {fullscreen}
        {processSchemaDef}
        {coreSidebarProps}
      />
    </FieldWrapper>
  {:else}
    <p>Error: The collaborative document or websocket was not found ({key}).</p>
  {/if}
{:else if fullscreen && mode === 'editor'}
  <!-- capture loop for all non-body fields when in fullscreen mode so they do not render -->
{:else if def.type === 'DocArray' || type === 'DocArray'}
  <p>DocArray: {key}</p>
{:else if key.includes('#')}
  <p>Internal: {key}</p>
{:else if def.field?.reference?.collection || isTypeTuple(def.type)}
  <!-- TODO: add property for adding filter and sort to the query -->

  {@const collection = isTypeTuple(def.type)
    ? def.type[0].replace('[', '').replace(']', '')
    : def.field?.reference?.collection || ''}

  {@const reference = { ...(def.field?.reference || {}), collection }}

  {#if isArrayType}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <SelectMany {disabled} {ydoc} {ydocKey} {reference} />
    </FieldWrapper>
  {:else}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <SelectOne {disabled} {ydoc} {ydocKey} {reference} />
    </FieldWrapper>
  {/if}
{:else if type === 'String' && def.field?.markdown}
  <p>Markdown: {key}</p>
{:else if type === 'String'}
  {#if options}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <SelectOne {disabled} {ydoc} {ydocKey} {options} showCurrentSelectionOnDropdown />
    </FieldWrapper>
  {:else if !!$ydoc && !!$wsProvider}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <TextTiptap {disabled} {ydoc} {ydocKey} {wsProvider} {user} />
    </FieldWrapper>
  {:else}
    <p>Error: The collaborative document or websocket was not found ({key}).</p>
  {/if}
{:else if type === 'Boolean'}
  <FieldWrapper label={fieldName} {description} forId={key} mode="checkbox">
    <StatelessCheckbox {disabled} {ydoc} {ydocKey} id={key} />
  </FieldWrapper>
{:else if type === 'Number'}
  {#if options}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <SelectOne {disabled} {ydoc} {ydocKey} {options} showCurrentSelectionOnDropdown />
    </FieldWrapper>
  {:else if !!$ydoc && !!$wsProvider}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <NumberTiptap {disabled} {ydoc} {ydocKey} {wsProvider} {user} allowDecimals={false} />
    </FieldWrapper>
  {:else}
    <p>Error: The collaborative document or websocket was not found ({key}).</p>
  {/if}
{:else if type === 'Float'}
  {#if options}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <SelectOne {disabled} {ydoc} {ydocKey} {options} showCurrentSelectionOnDropdown />
    </FieldWrapper>
  {:else if !!$ydoc && !!$wsProvider}
    <FieldWrapper label={fieldName} {description} forId={key}>
      <NumberTiptap {disabled} {ydoc} {ydocKey} {wsProvider} {user} allowDecimals={true} />
    </FieldWrapper>
  {:else}
    <p>Error: The collaborative document or websocket was not found ({key}).</p>
  {/if}
{:else if type === 'Date'}
  <FieldWrapper label={fieldName} {description} forId={key}>
    <DateTime {disabled} {ydoc} {ydocKey} />
  </FieldWrapper>
{:else if Array.isArray(type) && type[0] === 'String'}
  <FieldWrapper label={fieldName} {description} forId={key}>
    <SelectMany {disabled} {ydoc} {ydocKey} {options} />
  </FieldWrapper>
{:else if Array.isArray(type) && type[0] === 'Number'}
  <FieldWrapper label={fieldName} {description} forId={key}>
    <SelectOne {disabled} {ydoc} {ydocKey} {options} />
  </FieldWrapper>
{:else if Array.isArray(type) && type[0] === 'Float'}
  <FieldWrapper label={fieldName} {description} forId={key}>
    <SelectOne {disabled} {ydoc} {ydocKey} {options} />
  </FieldWrapper>
{:else}
  <p>Unsupported Type ({JSON.stringify(type)}): {key}</p>
{/if}