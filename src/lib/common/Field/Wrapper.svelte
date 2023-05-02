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

  $: hasCaption = !!$$slots.caption || !!description;
</script>

<div class="field" data-for={forId} class:nocaption={!hasCaption}>
  <div class="field-label">
    <TextBlock tag="span">{@html dompurify.sanitize(label)}</TextBlock>
  </div>
  {#if hasCaption}
    <label for={forId}>
      <TextBlock variant="caption" tag="span">
        {#if $$slots.caption}
          <slot name="caption" />
        {:else}
          {@html dompurify.sanitize(description)}
        {/if}
      </TextBlock>
    </label>
  {/if}
  <slot />
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
  div.field.nocaption > .field-label {
    margin-bottom: 6px;
  }
  div.field > label {
    margin-bottom: 6px;
    opacity: 0.8;
  }
</style>
