<script lang="ts">
  import { browser } from '$app/environment';
  import { themeMode } from '$stores/themeMode';

  // update meta theme color to match titlebar based on theme mode
  $: {
    if (browser) {
      const currentMetaTheme = document?.querySelector('meta[name=theme-color]');
      if (currentMetaTheme) {
        currentMetaTheme.remove();
        const newMeta = document.createElement('meta');
        newMeta.name = 'theme-color';
        newMeta.content = $themeMode === 'dark' ? '#202020' : '#f3f3f3';
        document.head.appendChild(newMeta);
      }
    }
  }
</script>

<slot />

<div>
  <style>
    .root-splash-wrapper {
      display: none !important;
    }
  </style>
</div>
