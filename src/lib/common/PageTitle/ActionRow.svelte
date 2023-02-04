<script lang="ts">
  export let fullWidth = false;
</script>

<div class="button-row" class:fullWidth>
  <slot />
</div>

<style>
  .button-row {
    margin: 20px auto;
    padding: 0 20px;
    max-width: 1000px;
    display: flex;
    gap: 10px;
  }

  .button-row.fullWidth {
    max-width: none;
  }
</style>
