<script lang="ts">
  import { Playground as PlaygroundPage } from '$react/playground';
  import { themeMode } from '$stores/themeMode';

  function setThemeMode(mode: unknown) {
    if (mode === 'light' || mode === 'dark') {
      $themeMode = mode;
    }
  }
</script>

<react:PlaygroundPage {setThemeMode} />
