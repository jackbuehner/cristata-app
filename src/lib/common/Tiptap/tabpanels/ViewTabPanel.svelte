<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton } from 'fluent-svelte';
  import type { tiptapOptions } from '../../../../config';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;
</script>

<div class="panel" class:visible>
  <Button disabled={disabled || true}>
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 m -204 -1229 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
        />
        <path type="path" class="OfficeIconColors_m20" d="M 358 1894 v -1740 h 1332 v 1740 z" />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m23"
          d="M 1434 614 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
        />
      </svg>
    </FluentIcon>
    Editing mode
  </Button>
  <Button disabled={disabled || true}>
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1280 256 h 683 v 1536 h -683 q -72 0 -139 24 q -68 24 -122 84 q -19 21 -46 21 q -28 0 -46 -21 q -54 -60 -113 -84 q -59 -24 -131 -24 h -683 v -1536 h 683 q 42 0 81 15 q 38 15 74 38 q 35 23 69 50 q 33 28 65 53 h 2 q 32 -25 68 -53 q 36 -27 75 -50 q 39 -23 80 -38 q 41 -15 83 -15 m -597 1451 q 73 0 136 20 q 63 20 120 67 v -1300 q -27 -25 -56 -52 q -30 -27 -61 -50 q -32 -22 -66 -37 q -35 -14 -73 -14 h -598 v 1366 m 1792 0 v -1366 h -597 q -35 0 -69 12 q -35 13 -67 33 q -33 20 -63 44 q -30 25 -57 49 v 1303 q 57 -41 122 -58 q 65 -17 134 -17 m -512 -1024 h -512 v -86 h 512 m 0 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 1451 -768 v 598 h -512 v -598 m 426 86 h -341 v 426 h 341 m 86 256 v 86 h -512 v -86 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m20"
          d="M 1206 312 h 712 v 1444 h -750 l -190 113 l -223 -113 h -714 v -1444 h 695 l 240 155 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1280 256 h 683 v 1536 h -683 q -72 0 -139 24 q -68 24 -122 84 q -19 21 -46 21 q -28 0 -46 -21 q -54 -60 -113 -84 q -59 -24 -131 -24 h -683 v -1536 h 683 q 42 0 81 15 q 38 15 74 38 q 35 23 69 50 q 33 28 65 53 h 2 q 32 -25 68 -53 q 36 -27 75 -50 q 39 -23 80 -38 q 41 -15 83 -15 m -597 1451 q 73 0 136 20 q 63 20 120 67 v -1300 q -27 -25 -56 -52 q -30 -27 -61 -50 q -32 -22 -66 -37 q -35 -14 -73 -14 h -598 v 1366 m 1792 0 v -1366 h -597 q -35 0 -69 12 q -35 13 -67 33 q -33 20 -63 44 q -30 25 -57 49 v 1303 q 57 -41 122 -58 q 65 -17 134 -17 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m23"
          d="M 768 683 h -512 v -86 h 512 m 0 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 512 256 v 86 h -512 v -86 m 1451 -768 v 598 h -512 v -598 m 426 86 h -341 v 426 h 341 m 86 256 v 86 h -512 v -86 z"
        />
      </svg>
    </FluentIcon>
    Preview mode
  </Button>
</div>

<style>
</style>
