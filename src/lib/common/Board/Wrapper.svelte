<script lang="ts">
  export let columns = 1;
</script>

<div class="board-wrapper" style="--columns: {columns}">
  <slot />
</div>

<style>
  .board-wrapper {
    padding: 15px 20px 20px 20px;
    height: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(var(--columns), 300px);
    grid-auto-columns: 300px;
    gap: 10px;
    overflow: auto;
  }
</style>
