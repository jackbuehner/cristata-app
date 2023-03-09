<script lang="ts">
  import { ProgressRing, TextBlock } from 'fluent-svelte';

  export let message = 'Loading...';
  export let style = '';
</script>

<div {style}>
  <ProgressRing size={24} />
  <TextBlock variant="bodyStrong">
    {message}
  </TextBlock>
</div>

<style>
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
</style>
