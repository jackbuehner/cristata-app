<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import type { Editor } from '@tiptap/core';
  import { ComboBox, IconButton } from 'fluent-svelte';
  import type { tiptapOptions } from '../../../../config';

  export let editor: Editor | null;
  export let visible = false;
  export let disabled = false;
  export let options: tiptapOptions | undefined = undefined;

  $: textStyle = editor?.getAttributes('textStyle');
  $: fontFamily = textStyle?.fontFamily || 'Georgia';
  $: fontSize = textStyle?.fontSize || '17px';
</script>

<div class="panel" class:visible>
  <IconButton
    on:click={() => editor?.chain().focus().undo().run()}
    disabled={disabled || !editor?.can().undo()}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1229 102 q 85 0 164 22 q 78 22 146 62 q 68 40 124 96 q 56 56 96 124 q 40 69 62 147 q 22 79 22 164 q 0 77 -16 146 q -16 69 -44 129 q -28 61 -65 113 q -38 52 -80 94 l -744 747 l -75 -73 l 747 -747 q 35 -35 67 -75 q 31 -39 55 -88 q 24 -48 39 -109 q 14 -60 14 -137 q 0 -109 -41 -203 q -42 -93 -113 -162 q -71 -69 -166 -108 q -96 -39 -204 -39 q -89 0 -173 33 q -85 34 -152 102 l -513 479 h 645 v 103 h -819 v -820 h 102 v 642 l 512 -477 q 86 -86 192 -126 q 105 -39 218 -39 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1229 102 q 85 0 164 22 q 78 22 146 62 q 68 40 124 96 q 56 56 96 124 q 40 69 62 147 q 22 79 22 164 q 0 77 -16 146 q -16 69 -44 129 q -28 61 -65 113 q -38 52 -80 94 l -744 747 l -75 -73 l 747 -747 q 35 -35 67 -75 q 31 -39 55 -88 q 24 -48 39 -109 q 14 -60 14 -137 q 0 -109 -41 -203 q -42 -93 -113 -162 q -71 -69 -166 -108 q -96 -39 -204 -39 q -89 0 -173 33 q -85 34 -152 102 l -513 479 h 645 v 103 h -819 v -820 h 102 v 642 l 512 -477 q 86 -86 192 -126 q 105 -39 218 -39 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
  <IconButton
    on:click={() => editor?.chain().focus().redo().run()}
    disabled={disabled || !editor?.can().redo()}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 819 102 q 112 0 218 39 q 105 40 192 126 l 512 477 v -642 h 102 v 820 h -819 v -103 h 645 l -513 -479 q -67 -68 -151 -102 q -85 -33 -175 -33 q -108 0 -203 39 q -95 39 -166 108 q -71 69 -112 162 q -42 94 -42 203 q 0 77 15 137 q 14 61 38 109 q 24 49 56 88 q 31 40 66 75 l 747 747 l -75 73 l -744 -747 q -42 -42 -79 -94 q -38 -52 -66 -113 q -28 -60 -44 -129 q -16 -69 -16 -146 q 0 -85 22 -164 q 22 -78 62 -147 q 40 -68 96 -124 q 56 -56 124 -96 q 68 -40 147 -62 q 78 -22 163 -22 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 819 102 q 112 0 218 39 q 105 40 192 126 l 512 477 v -642 h 102 v 820 h -819 v -103 h 645 l -513 -479 q -67 -68 -151 -102 q -85 -33 -175 -33 q -108 0 -203 39 q -95 39 -166 108 q -71 69 -112 162 q -42 94 -42 203 q 0 77 15 137 q 14 61 38 109 q 24 49 56 88 q 31 40 66 75 l 747 747 l -75 73 l -744 -747 q -42 -42 -79 -94 q -38 -52 -66 -113 q -28 -60 -44 -129 q -16 -69 -16 -146 q 0 -85 22 -164 q 22 -78 62 -147 q 40 -68 96 -124 q 56 -56 124 -96 q 68 -40 147 -62 q 78 -22 163 -22 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>

  <span class="bar" />

  {#key fontFamily}
    <ComboBox
      editable
      openOnFocus
      items={options?.features.fontFamilies?.map(({ name, label, disabled }) => ({
        name: label || name,
        value: name,
        disabled,
      }))}
      style="width: 160px;"
      disabled={disabled ||
        !editor?.can().setFontFamily('Georgia') ||
        (options?.features.fontFamilies || []).length === 0}
      value={fontFamily}
      on:select={(evt) => {
        editor
          ?.chain()
          .command(({ commands }) => {
            // do not re-focus editor unless current focus is on the combobox
            // so focus is not stolen from other elements if the combobox rerenders
            // and the select event is fired again (it is fired upon render or when
            // the selection changes to a different font)
            const currentFocusOnComboboxItem = document.activeElement?.classList.contains('combo-box-item');
            const currentFocusOnComboboxTextField = document.activeElement?.getAttribute('role') === 'combobox';
            if (currentFocusOnComboboxTextField || currentFocusOnComboboxItem) return commands.focus();
            return true;
          })
          .setFontFamily(evt.detail.value)
          .run();
      }}
    />
  {/key}
  {#key fontSize}
    <ComboBox
      editable
      openOnFocus
      items={[{ name: '17px', value: '17px' }]}
      style="width: 84px;"
      disabled={disabled || (options?.features.fontSizes || []).length === 0}
      value={fontSize}
    />
  {/key}

  <IconButton
    on:click={() => editor?.chain().focus().toggleBold().run()}
    disabled={disabled || !editor?.can().toggleBold()}
    class={editor?.isActive('bold') ? 'active' : ''}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1563 1213 q 0 97 -36 175 q -36 79 -104 134 q -68 56 -165 86 q -97 30 -218 30 h -528 v -1433 h 499 q 120 0 212 23 q 92 23 155 66 q 63 44 96 107 q 32 64 32 145 q 0 55 -20 106 q -20 51 -56 93 q -37 43 -88 75 q -51 32 -113 48 v 4 q 73 9 134 38 q 61 29 106 73 q 44 45 69 103 q 25 59 25 127 m -374 -607 q 0 -39 -15 -75 q -15 -35 -44 -62 q -29 -27 -73 -43 q -45 -16 -103 -16 h -135 v 409 h 156 q 25 0 62 -13 q 36 -12 70 -38 q 33 -26 58 -66 q 24 -40 24 -96 m 59 620 q 0 -94 -61 -148 q -62 -54 -178 -54 h -190 v 410 h 188 q 52 0 96 -12 q 44 -11 76 -37 q 32 -25 50 -64 q 18 -39 19 -95 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1563 1213 q 0 97 -36 175 q -36 79 -104 134 q -68 56 -165 86 q -97 30 -218 30 h -528 v -1433 h 499 q 120 0 212 23 q 92 23 155 66 q 63 44 96 107 q 32 64 32 145 q 0 55 -20 106 q -20 51 -56 93 q -37 43 -88 75 q -51 32 -113 48 v 4 q 73 9 134 38 q 61 29 106 73 q 44 45 69 103 q 25 59 25 127 m -374 -607 q 0 -39 -15 -75 q -15 -35 -44 -62 q -29 -27 -73 -43 q -45 -16 -103 -16 h -135 v 409 h 156 q 25 0 62 -13 q 36 -12 70 -38 q 33 -26 58 -66 q 24 -40 24 -96 m 59 620 q 0 -94 -61 -148 q -62 -54 -178 -54 h -190 v 410 h 188 q 52 0 96 -12 q 44 -11 76 -37 q 32 -25 50 -64 q 18 -39 19 -95 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
  <IconButton
    on:click={() => editor?.chain().focus().toggleItalic().run()}
    disabled={disabled || !editor?.can().toggleItalic()}
    class={editor?.isActive('italic') ? 'active' : ''}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 1398 307 h -158 l -261 1229 h 234 l -102 102 h -563 l 102 -102 h 166 l 259 -1229 h -240 l 102 -102 h 563 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1398 307 h -158 l -261 1229 h 234 l -102 102 h -563 l 102 -102 h 166 l 259 -1229 h -240 l 102 -102 h 563 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
  <IconButton
    on:click={() => editor?.chain().focus().toggleUnderline().run()}
    disabled={disabled || !editor?.can().toggleUnderline()}
    class={editor?.isActive('underline') ? 'active' : ''}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 410 1843 h 1228 v 103 h -1228 m 1126 -922 q 0 581 -523 581 q -501 0 -501 -559 v -841 h 161 v 832 q 0 422 358 422 q 344 0 344 -409 v -845 h 161 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 410 1843 h 1228 v 103 h -1228 m 1126 -922 q 0 581 -523 581 q -501 0 -501 -559 v -841 h 161 v 832 q 0 422 358 422 q 344 0 344 -409 v -845 h 161 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
  <IconButton
    on:click={() => editor?.chain().focus().toggleStrike().run()}
    disabled={disabled || !editor?.can().toggleStrike()}
    class={editor?.isActive('strike') ? 'active' : ''}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 2048 1126 v 103 h -236 q -9 93 -41 169 q -33 76 -84 129 q -52 53 -120 82 q -69 29 -150 29 q -188 0 -279 -163 h -3 v 143 h -111 v -389 h -205 v 389 h -110 v -158 h -4 q -44 86 -118 132 q -74 46 -169 46 q -63 0 -114 -18 q -52 -18 -88 -51 q -36 -33 -55 -80 q -20 -46 -20 -103 q 0 -94 45 -157 h -186 v -103 h 333 q 24 -8 51 -14 q 26 -5 56 -10 l 269 -39 q 0 -255 -198 -255 q -156 0 -287 113 v -121 q 25 -19 61 -35 q 35 -16 75 -28 q 39 -12 81 -19 q 41 -6 79 -6 q 147 0 223 82 q 76 82 76 248 v 84 h 205 v -819 h 111 v 595 h 3 q 50 -93 133 -142 q 82 -48 185 -48 q 83 0 149 29 q 65 30 112 84 q 46 54 72 130 q 25 77 27 171 m -1107 117 v -14 h -375 q -41 19 -60 57 q -19 38 -19 93 q 0 37 13 67 q 13 30 37 51 q 24 22 58 34 q 34 12 76 12 q 59 0 109 -23 q 49 -23 85 -63 q 36 -40 56 -95 q 20 -55 20 -119 m 463 -275 q -37 74 -37 158 h 567 q -2 -72 -21 -131 q -20 -58 -54 -100 q -35 -41 -83 -64 q -49 -23 -110 -23 q -89 0 -158 42 q -69 43 -104 118 m 452 467 q 59 -79 74 -206 h -563 v 20 q 0 62 21 115 q 21 54 58 94 q 37 40 88 62 q 51 23 111 23 q 133 0 211 -108 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 2048 1126 v 103 h -236 q -9 93 -41 169 q -33 76 -84 129 q -52 53 -120 82 q -69 29 -150 29 q -188 0 -279 -163 h -3 v 143 h -111 v -389 h -205 v 389 h -110 v -158 h -4 q -44 86 -118 132 q -74 46 -169 46 q -63 0 -114 -18 q -52 -18 -88 -51 q -36 -33 -55 -80 q -20 -46 -20 -103 q 0 -94 45 -157 h -186 v -103 h 333 q 24 -8 51 -14 q 26 -5 56 -10 l 269 -39 q 0 -255 -198 -255 q -156 0 -287 113 v -121 q 25 -19 61 -35 q 35 -16 75 -28 q 39 -12 81 -19 q 41 -6 79 -6 q 147 0 223 82 q 76 82 76 248 v 84 h 205 v -819 h 111 v 595 h 3 q 50 -93 133 -142 q 82 -48 185 -48 q 83 0 149 29 q 65 30 112 84 q 46 54 72 130 q 25 77 27 171 m -1107 117 v -14 h -375 q -41 19 -60 57 q -19 38 -19 93 q 0 37 13 67 q 13 30 37 51 q 24 22 58 34 q 34 12 76 12 q 59 0 109 -23 q 49 -23 85 -63 q 36 -40 56 -95 q 20 -55 20 -119 m 463 -275 q -37 74 -37 158 h 567 q -2 -72 -21 -131 q -20 -58 -54 -100 q -35 -41 -83 -64 q -49 -23 -110 -23 q -89 0 -158 42 q -69 43 -104 118 m 452 467 q 59 -79 74 -206 h -563 v 20 q 0 62 21 115 q 21 54 58 94 q 37 40 88 62 q 51 23 111 23 q 133 0 211 -108 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
  <IconButton
    on:click={() => editor?.chain().focus().toggleCode().run()}
    disabled={disabled || !editor?.can().toggleCode()}
    class={editor?.isActive('code') ? 'active' : ''}
  >
    <FluentIcon name="Code20Regular" />
  </IconButton>

  <span class="bar" />

  <IconButton
    on:click={() => editor?.chain().focus().toggleBulletList().run()}
    disabled={disabled || !editor?.can().toggleBulletList()}
    class={editor?.isActive('bulletList') ? 'active' : ''}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 410 410 h -308 v -308 h 308 m 0 717 v 307 h -308 v -307 m 308 717 v 307 h -308 v -307 m 1844 -512 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 410 410 h -308 v -308 h 308 m 0 717 v 307 h -308 v -307 m 308 717 v 307 h -308 v -307 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1946 1024 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>
  <IconButton
    on:click={() => editor?.chain().focus().toggleOrderedList().run()}
    disabled={disabled || !editor?.can().toggleOrderedList()}
    class={editor?.isActive('orderedList') ? 'active' : ''}
  >
    <FluentIcon>
      <svg height="100%" width="100%" viewBox="0,0,2048,2048" focusable="false">
        <path
          type="path"
          class="OfficeIconColors_HighContrast"
          d="M 307 0 v 512 h -81 v -413 q -41 29 -105 46 v -69 q 24 -7 44 -16 q 19 -8 37 -17 q 18 -9 36 -20 q 17 -10 35 -23 m 145 1229 h -316 v -39 q 0 -45 26 -86 q 26 -41 93 -94 q 31 -25 52 -44 q 20 -18 33 -35 q 12 -16 17 -32 q 5 -15 5 -35 q 0 -38 -22 -59 q -23 -21 -60 -21 q -65 0 -125 57 v -78 q 31 -23 63 -35 q 32 -11 77 -11 q 69 0 110 35 q 40 36 40 103 q 0 32 -6 56 q -7 25 -24 48 q -17 23 -45 48 q -29 26 -72 60 q -38 30 -55 50 q -18 20 -18 38 v 4 h 227 m -11 636 q 0 68 -49 109 q -50 42 -135 42 q -32 0 -66 -8 q -35 -8 -52 -19 v -79 q 22 18 54 29 q 32 11 64 11 q 47 0 74 -22 q 27 -22 27 -60 q 0 -83 -125 -83 h -43 v -66 h 41 q 51 0 81 -19 q 30 -19 30 -59 q 0 -35 -23 -54 q -24 -18 -63 -18 q -54 0 -98 35 v -73 q 22 -12 53 -20 q 31 -7 66 -7 q 63 0 105 31 q 41 32 41 89 q 0 48 -26 79 q -26 32 -72 44 v 2 q 54 6 85 37 q 31 32 31 79 m 1539 -771 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m24"
          d="M 307 0 v 512 h -81 v -413 q -41 29 -105 46 v -69 q 24 -7 44 -16 q 19 -8 37 -17 q 18 -9 36 -20 q 17 -10 35 -23 m 145 1229 h -316 v -39 q 0 -45 26 -86 q 26 -41 93 -94 q 31 -25 52 -44 q 20 -18 33 -35 q 12 -16 17 -32 q 5 -15 5 -35 q 0 -38 -22 -59 q -23 -21 -60 -21 q -65 0 -125 57 v -78 q 31 -23 63 -35 q 32 -11 77 -11 q 69 0 110 35 q 40 36 40 103 q 0 32 -6 56 q -7 25 -24 48 q -17 23 -45 48 q -29 26 -72 60 q -38 30 -55 50 q -18 20 -18 38 v 4 h 227 m -11 636 q 0 68 -49 109 q -50 42 -135 42 q -32 0 -66 -8 q -35 -8 -52 -19 v -79 q 22 18 54 29 q 32 11 64 11 q 47 0 74 -22 q 27 -22 27 -60 q 0 -83 -125 -83 h -43 v -66 h 41 q 51 0 81 -19 q 30 -19 30 -59 q 0 -35 -23 -54 q -24 -18 -63 -18 q -54 0 -98 35 v -73 q 22 -12 53 -20 q 31 -7 66 -7 q 63 0 105 31 q 41 32 41 89 q 0 48 -26 79 q -26 32 -72 44 v 2 q 54 6 85 37 q 31 32 31 79 z"
        />
        <path
          type="path"
          class="OfficeIconColors_m22"
          d="M 1946 1024 h -1229 v -102 h 1229 m 0 -717 v 102 h -1229 v -102 m 1229 1433 v 103 h -1229 v -103 z"
        />
      </svg>
    </FluentIcon>
  </IconButton>

  <span class="bar" />

  <ComboBox editable openOnFocus disabled items={[{ name: 'Title', value: 'title' }]} style="width: 180px;" />
</div>

<style>
</style>