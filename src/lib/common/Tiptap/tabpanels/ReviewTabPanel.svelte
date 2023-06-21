<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { IconButton } from 'fluent-svelte';

  export let visible = false;
</script>

<div class="panel" class:visible>
  <IconButton>
    <FluentIcon name="ArrowUndo20Regular" />
  </IconButton>
  <IconButton>
    <FluentIcon name="ArrowRedo20Regular" />
  </IconButton>
</div>

<style>
</style>
