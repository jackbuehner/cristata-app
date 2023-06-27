<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import PhotoWidgetDialog from '$lib/dialogs/PhotoWidgetDialog.svelte';
  import type { Editor } from '@tiptap/core';
  import { Button, IconButton, Tooltip } from 'fluent-svelte';
  import { tick } from 'svelte';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let setTab: (tabName: string) => void;

  let photoTabWasActive = false;
  $: if (editor?.isActive('photoWidget') && photoTabWasActive === false) {
    setTab('photo');
    photoTabWasActive = true;
  }
  $: if (!editor?.isActive('photoWidget') && photoTabWasActive === true) {
    tick().then(() => {
      if (visible) setTab('home');
      photoTabWasActive = false;
    });
  }

  let width = 1000;
  let position: 'center' | 'left' | 'right';
  $: position = editor?.isActive('photoWidget', { position: 'left' })
    ? 'left'
    : editor?.isActive('photoWidget', { position: 'right' })
    ? 'right'
    : 'center';

  let photoWidgetDialogOpen = false;
  $: if (!editor?.isActive('photoWidget')) photoWidgetDialogOpen = false;

  function deletePhotoNode() {
    editor
      ?.chain()
      .focus()
      .selectParentNode()
      .updateAttributes('photoWidget', { showCaption: true })
      .focus()
      .deleteNode('photoWidget')
      .run();
  }

  function setPosition(position: 'center' | 'left' | 'right') {
    if (!editor) return;
    editor.chain().focus().selectParentNode().updateAttributes('photoWidget', { position }).run();
  }
</script>

<div class="panel" class:visible bind:offsetWidth={width}>
  <PhotoWidgetDialog
    bind:open={photoWidgetDialogOpen}
    title="Change photo"
    handleSumbit={async (photoId) => {
      editor?.chain().focus().selectParentNode().updateAttributes('photoWidget', { photoId }).run();
    }}
  />
  <Tooltip text="Change to a different photo">
    {#if width < 550}
      <IconButton
        disabled={disabled || !editor?.isActive('photoWidget')}
        on:click={() => (photoWidgetDialogOpen = !photoWidgetDialogOpen)}
      >
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 512 922 h -205 v -205 h 205 m -205 409 h 205 v 205 h -205 m 1229 -614 h 205 v 158 q -43 -48 -94 -87 q -51 -39 -111 -66 m -754 916 q 40 56 93 103 h -773 v -1434 h 1844 v 1361 l -103 -102 v -45 q 25 -57 38 -118 q 13 -60 13 -123 q 0 -66 -13 -127 q -13 -61 -38 -118 v -625 h -102 v 102 h -205 v -102 h -1024 v 102 h -205 v -102 h -102 v 1228 h 102 v -102 h 205 v 102 m 1524 337 q 12 14 12 31 q 0 18 -13 30 q -13 12 -30 12 q -18 0 -30 -12 l -402 -403 q -60 50 -134 79 q -74 29 -159 29 q -96 0 -180 -36 q -84 -36 -146 -99 q -63 -62 -99 -146 q -36 -84 -36 -180 q 0 -96 36 -180 q 36 -84 99 -147 q 62 -62 146 -98 q 84 -36 180 -36 q 96 0 180 36 q 84 36 147 98 q 62 63 98 147 q 36 84 36 180 q 0 85 -29 159 q -29 74 -79 134 m -353 65 q 74 0 140 -28 q 65 -28 114 -77 q 48 -48 76 -114 q 28 -65 28 -139 q 0 -74 -28 -140 q -28 -65 -76 -114 q -49 -48 -114 -76 q -66 -28 -140 -28 q -74 0 -139 28 q -66 28 -114 76 q -49 49 -77 114 q -28 66 -28 140 q 0 74 28 139 q 28 66 77 114 q 48 49 114 77 q 65 28 139 28 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 666 1280 q 0 118 42 223 q 42 105 115 187 h -669 v -1332 h 1740 v 922 q 0 -85 -22 -164 q -22 -78 -62 -146 q -40 -68 -96 -124 q -56 -56 -124 -96 q -68 -40 -146 -62 q -79 -22 -164 -22 q -85 0 -163 22 q -79 22 -147 62 q -68 40 -124 96 q -56 56 -96 124 q -40 68 -62 146 q -22 79 -22 164 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 512 922 h -205 v -205 h 205 m -205 409 h 205 v 205 h -205 m 1229 -614 h 205 v 158 q -43 -48 -94 -87 q -51 -39 -111 -66 m -754 916 q 40 56 93 103 h -773 v -1434 h 1844 v 1361 l -103 -102 v -45 q 25 -57 38 -118 q 13 -60 13 -123 q 0 -66 -13 -127 q -13 -61 -38 -118 v -625 h -102 v 102 h -205 v -102 h -1024 v 102 h -205 v -102 h -102 v 1228 h 102 v -102 h 205 v 102 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1280 1690 q -85 0 -159 -33 q -75 -32 -130 -88 q -56 -55 -88 -130 q -33 -74 -33 -159 q 0 -85 33 -160 q 32 -74 88 -130 q 55 -55 130 -88 q 74 -32 159 -32 q 85 0 160 32 q 74 33 130 88 q 55 56 88 130 q 32 75 32 160 q 0 85 -32 159 q -33 75 -88 130 q -56 56 -130 88 q -75 33 -160 33 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 2036 1975 q 12 14 12 31 q 0 18 -13 30 q -13 12 -30 12 q -18 0 -30 -12 l -402 -403 q -60 50 -134 79 q -74 29 -159 29 q -96 0 -180 -36 q -84 -36 -146 -99 q -63 -62 -99 -146 q -36 -84 -36 -180 q 0 -96 36 -180 q 36 -84 99 -147 q 62 -62 146 -98 q 84 -36 180 -36 q 96 0 180 36 q 84 36 147 98 q 62 63 98 147 q 36 84 36 180 q 0 85 -29 159 q -29 74 -79 134 m -353 65 q 74 0 140 -28 q 65 -28 114 -77 q 48 -48 76 -114 q 28 -65 28 -139 q 0 -74 -28 -140 q -28 -65 -76 -114 q -49 -48 -114 -76 q -66 -28 -140 -28 q -74 0 -139 28 q -66 28 -114 76 q -49 49 -77 114 q -28 66 -28 140 q 0 74 28 139 q 28 66 77 114 q 48 49 114 77 q 65 28 139 28 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button
        disabled={disabled || !editor?.isActive('photoWidget')}
        on:click={() => (photoWidgetDialogOpen = !photoWidgetDialogOpen)}
      >
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 512 922 h -205 v -205 h 205 m -205 409 h 205 v 205 h -205 m 1229 -614 h 205 v 158 q -43 -48 -94 -87 q -51 -39 -111 -66 m -754 916 q 40 56 93 103 h -773 v -1434 h 1844 v 1361 l -103 -102 v -45 q 25 -57 38 -118 q 13 -60 13 -123 q 0 -66 -13 -127 q -13 -61 -38 -118 v -625 h -102 v 102 h -205 v -102 h -1024 v 102 h -205 v -102 h -102 v 1228 h 102 v -102 h 205 v 102 m 1524 337 q 12 14 12 31 q 0 18 -13 30 q -13 12 -30 12 q -18 0 -30 -12 l -402 -403 q -60 50 -134 79 q -74 29 -159 29 q -96 0 -180 -36 q -84 -36 -146 -99 q -63 -62 -99 -146 q -36 -84 -36 -180 q 0 -96 36 -180 q 36 -84 99 -147 q 62 -62 146 -98 q 84 -36 180 -36 q 96 0 180 36 q 84 36 147 98 q 62 63 98 147 q 36 84 36 180 q 0 85 -29 159 q -29 74 -79 134 m -353 65 q 74 0 140 -28 q 65 -28 114 -77 q 48 -48 76 -114 q 28 -65 28 -139 q 0 -74 -28 -140 q -28 -65 -76 -114 q -49 -48 -114 -76 q -66 -28 -140 -28 q -74 0 -139 28 q -66 28 -114 76 q -49 49 -77 114 q -28 66 -28 140 q 0 74 28 139 q 28 66 77 114 q 48 49 114 77 q 65 28 139 28 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 666 1280 q 0 118 42 223 q 42 105 115 187 h -669 v -1332 h 1740 v 922 q 0 -85 -22 -164 q -22 -78 -62 -146 q -40 -68 -96 -124 q -56 -56 -124 -96 q -68 -40 -146 -62 q -79 -22 -164 -22 q -85 0 -163 22 q -79 22 -147 62 q -68 40 -124 96 q -56 56 -96 124 q -40 68 -62 146 q -22 79 -22 164 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m22"
              d="M 512 922 h -205 v -205 h 205 m -205 409 h 205 v 205 h -205 m 1229 -614 h 205 v 158 q -43 -48 -94 -87 q -51 -39 -111 -66 m -754 916 q 40 56 93 103 h -773 v -1434 h 1844 v 1361 l -103 -102 v -45 q 25 -57 38 -118 q 13 -60 13 -123 q 0 -66 -13 -127 q -13 -61 -38 -118 v -625 h -102 v 102 h -205 v -102 h -1024 v 102 h -205 v -102 h -102 v 1228 h 102 v -102 h 205 v 102 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m20"
              d="M 1280 1690 q -85 0 -159 -33 q -75 -32 -130 -88 q -56 -55 -88 -130 q -33 -74 -33 -159 q 0 -85 33 -160 q 32 -74 88 -130 q 55 -55 130 -88 q 74 -32 159 -32 q 85 0 160 32 q 74 33 130 88 q 55 56 88 130 q 32 75 32 160 q 0 85 -32 159 q -33 75 -88 130 q -56 56 -130 88 q -75 33 -160 33 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m24"
              d="M 2036 1975 q 12 14 12 31 q 0 18 -13 30 q -13 12 -30 12 q -18 0 -30 -12 l -402 -403 q -60 50 -134 79 q -74 29 -159 29 q -96 0 -180 -36 q -84 -36 -146 -99 q -63 -62 -99 -146 q -36 -84 -36 -180 q 0 -96 36 -180 q 36 -84 99 -147 q 62 -62 146 -98 q 84 -36 180 -36 q 96 0 180 36 q 84 36 147 98 q 62 63 98 147 q 36 84 36 180 q 0 85 -29 159 q -29 74 -79 134 m -353 65 q 74 0 140 -28 q 65 -28 114 -77 q 48 -48 76 -114 q 28 -65 28 -139 q 0 -74 -28 -140 q -28 -65 -76 -114 q -49 -48 -114 -76 q -66 -28 -140 -28 q -74 0 -139 28 q -66 28 -114 76 q -49 49 -77 114 q -28 66 -28 140 q 0 74 28 139 q 28 66 77 114 q 48 49 114 77 q 65 28 139 28 z"
            />
          </svg>
        </FluentIcon>
        Change video
      </Button>
    {/if}
  </Tooltip>

  <Tooltip text="Delete the photo widget">
    {#if width < 550}
      <IconButton disabled={disabled || !editor?.isActive('photoWidget')} on:click={deletePhotoNode}>
        <FluentIcon>
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
          </svg>
        </FluentIcon>
      </IconButton>
    {:else}
      <Button disabled={disabled || !editor?.isActive('photoWidget')} on:click={deletePhotoNode}>
        <FluentIcon mode="ribbonButtonIconLeft">
          <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
            <path
              type="path"
              class="OfficeIconColors_HighContrast"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
            <path
              type="path"
              class="OfficeIconColors_m213"
              d="M 1096 1024 l 645 645 l -73 72 l -644 -645 l -645 645 l -72 -72 l 645 -645 l -645 -644 l 72 -73 l 645 645 l 644 -645 l 73 73 z"
            />
          </svg>
        </FluentIcon>
        Delete photo
      </Button>
    {/if}
  </Tooltip>

  <span class="bar" />

  <Button
    disabled={disabled || !editor?.isActive('photoWidget')}
    on:click={() => setPosition(position === 'left' ? 'center' : 'left')}
    class={position === 'left' ? 'active' : ''}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 205 102 v 1844 h -103 v -1844 m 1844 1024 h -1639 v -512 h 1639 m -1536 103 v 307 h 1433 v -307 m -717 -205 h -819 v -410 h 819 m -716 103 v 205 h 614 v -205 m -358 1024 l 72 72 l -235 235 h 828 v 102 h -828 l 235 235 l -72 73 l -359 -359 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m20"
          d="M 358 666 h 1536 v 409 h -1536 m 0 -921 h 717 v 307 h -717 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 205 102 v 1844 h -103 v -1844 m 1844 1024 h -1639 v -512 h 1639 m -1536 103 v 307 h 1433 v -307 m -717 -205 h -819 v -410 h 819 m -716 103 v 205 h 614 v -205 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 666 1229 l 72 72 l -235 235 h 828 v 102 h -828 l 235 235 l -72 73 l -359 -359 z"
        />
      </svg>
    </FluentIcon>
    Position left
  </Button>

  <Button
    disabled={disabled || !editor?.isActive('photoWidget')}
    on:click={() => setPosition(position === 'center' ? 'left' : 'center')}
    class={position === 'center' ? 'active' : ''}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1741 1024 v 512 h -717 v 410 h -102 v -410 h -717 v -512 h 717 v -205 h -512 v -409 h 512 v -308 h 102 v 308 h 512 v 409 h -512 v 205 m 410 -307 v -205 h -922 v 205 m 1126 409 h -1331 v 308 h 1331 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 1024 461 h -102 v -359 h 102 m 0 973 h -102 v -307 h 102 m 0 1178 h -102 v -461 h 102 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m20"
          d="M 256 1485 v -410 h 1434 v 410 m -1229 -717 v -307 h 1024 v 307 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1741 1024 v 512 h -1536 v -512 m 1433 102 h -1331 v 308 h 1331 m -102 -1024 v 409 h -1126 v -409 m 1024 102 h -922 v 205 h 922 z"
        />
      </svg>
    </FluentIcon>
    Full width
  </Button>

  <Button
    disabled={disabled || !editor?.isActive('photoWidget')}
    on:click={() => setPosition(position === 'right' ? 'center' : 'right')}
    class={position === 'right' ? 'active' : ''}
  >
    <FluentIcon mode="ribbonButtonIconLeft">
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1946 102 v 1844 h -103 v -1844 m -1741 512 h 1639 v 512 h -1639 m 103 -409 v 307 h 1433 v -307 m -716 -615 h 819 v 410 h -819 m 102 -307 v 205 h 614 v -205 m 103 1382 l -359 359 l -72 -73 l 235 -235 h -828 v -102 h 828 l -235 -235 l 72 -72 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m20"
          d="M 1690 1075 h -1536 v -409 h 1536 m 0 -205 h -717 v -307 h 717 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1946 102 v 1844 h -103 v -1844 m -1741 512 h 1639 v 512 h -1639 m 103 -409 v 307 h 1433 v -307 m -716 -615 h 819 v 410 h -819 m 102 -307 v 205 h 614 v -205 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 1741 1587 l -359 359 l -72 -73 l 235 -235 h -828 v -102 h 828 l -235 -235 l 72 -72 z"
        />
      </svg>
    </FluentIcon>
    Position right
  </Button>

  <span class="bar" />

  <Tooltip text="{editor?.isActive('photoWidget', { showCaption: true }) ? 'Hide' : 'Show'} photo caption">
    <Button
      disabled={disabled || !editor?.isActive('photoWidget')}
      on:click={() => {
        if (!editor) return;
        const captionShown = editor.isActive('photoWidget', { showCaption: true });
        editor
          .chain()
          .focus()
          .selectParentNode()
          .updateAttributes('photoWidget', { showCaption: !captionShown })
          .run();
      }}
      class={editor?.isActive('photoWidget', { showCaption: true }) ? 'active' : ''}
    >
      <FluentIcon mode="ribbonButtonIconLeft">
        <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
          <path
            type="path"
            class="OfficeIconColors_HighContrast"
            d="M 1741 102 v 1844 h -1434 v -1844 m 1331 103 h -1228 v 1638 h 1228 m -204 -1229 h -820 v -102 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -103 h 820 m 0 410 h -820 v -102 h 820 z"
          />
          <path type="path" class="OfficeIconColors_m20" d="M 1690 1894 h -1332 v -1740 h 1332 z" />
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
      Caption
    </Button>
  </Tooltip>
</div>

<style>
</style>
