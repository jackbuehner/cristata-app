<script lang="ts">
  import { TextBlock } from 'fluent-svelte';

  export let label: string;
  export let forId: string;
</script>

<div class="field" data-for={forId} class:nocaption={!$$slots.caption}>
  <div class="field-label">
    <TextBlock tag="span">{label}</TextBlock>
  </div>
  {#if $$slots.caption}
    <label for={forId}>
      <TextBlock variant="caption" tag="span">
        <slot name="caption" />
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
