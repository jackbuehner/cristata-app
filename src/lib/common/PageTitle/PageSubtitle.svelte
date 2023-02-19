<script lang="ts">
  import { TextBlock } from 'fluent-svelte';

  export let style: string;
</script>

<h2>
  <TextBlock variant="subtitle" tag="span" {style}><slot /></TextBlock>
</h2>

<style>
  h2 {
    margin: 25px auto 10px auto;
    padding: 0 20px;
    max-width: 1000px;
  }
</style>
