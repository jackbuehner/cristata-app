<script lang="ts">
  import { TextBlock } from 'fluent-svelte';
</script>

<h2>
  <TextBlock variant="subtitle"><slot /></TextBlock>
</h2>

<style>
  h2 {
    margin: 25px auto 10px auto;
    padding: 0 20px;
    max-width: 1000px;
  }
</style>
