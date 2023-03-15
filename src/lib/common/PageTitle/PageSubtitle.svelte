<script lang="ts">
  import { TextBlock } from 'fluent-svelte';

  export let style: string = '';
  export let caption: string = '';
</script>

<h2>
  <TextBlock variant="subtitle" tag="span" {style}><slot /></TextBlock>
</h2>

{#if caption}
  <p>
    <TextBlock tag="span">{caption}</TextBlock>
  </p>
{/if}

<style>
  h2,
  p {
    padding: 0 20px;
    max-width: 1000px;
  }
  h2 {
    margin: 25px auto 10px auto;
  }
  p {
    margin: -8px auto 10px auto;
  }
</style>
