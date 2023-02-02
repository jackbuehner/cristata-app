<script lang="ts">
  import { TextBlock } from 'fluent-svelte';
</script>

<h1>
  <TextBlock variant="title"><slot /></TextBlock>
</h1>

<style>
  h1 {
    margin: 32px auto 20px auto;
    padding: 0 20px;
    max-width: 1000px;
  }
</style>
