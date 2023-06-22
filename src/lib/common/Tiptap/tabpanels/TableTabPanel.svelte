<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import type { tiptapOptions } from '../../../../config';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
</script>

<div class="panel" class:visible />

<style>
</style>
