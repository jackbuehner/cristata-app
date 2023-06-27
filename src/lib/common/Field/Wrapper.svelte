<script lang="ts">
  import dompurify from 'dompurify';
  import { TextBlock } from 'fluent-svelte';

  export let label: string;
  export let forId: string;

  /**
   * A HTML string description for the field. Optionally, a more complex
   * description can be provided via the caption slot
   */
  export let description: string = '';

  export let mode: 'default' | 'checkbox' = 'default';

  $: hasCaption = !!$$slots.caption || !!description;
</script>

<div class="field" data-for={forId} class:nocaption={!hasCaption} class:checkbox={mode === 'checkbox'}>
  {#if mode === 'checkbox'}
    <slot />
  {/if}
  <div class="labels">
    <label class="field-label" for={forId}>
      <TextBlock tag="span">{@html dompurify.sanitize(label)}</TextBlock>
    </label>
    {#if hasCaption}
      <label class="caption" for={forId}>
        <TextBlock variant="caption" tag="span">
          {#if $$slots.caption}
            <slot name="caption" />
          {:else}
            {@html dompurify.sanitize(description)}
          {/if}
        </TextBlock>
      </label>
    {/if}
  </div>
  {#if mode === 'default'}
    <slot />
  {/if}
</div>

<style>
  div.field {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
  }
  div.field:last-of-type {
    margin-bottom: 10px;
  }
  div.labels {
    display: flex;
    flex-direction: column;
    user-select: none;
  }
  div.field.nocaption .field-label {
    margin-bottom: 6px;
    white-space: break-spaces;
  }
  div.field .caption {
    margin-bottom: 6px;
    opacity: 0.8;
    white-space: break-spaces;
  }

  div.field.checkbox {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: flex-start;
  }
  div.field.checkbox div.labels {
    gap: 3px;
    margin-top: -1px;
  }
</style>
