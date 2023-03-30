<script lang="ts">
  import { compactMode } from '$stores/compactMode';
  import { themeMode } from '$stores/themeMode';
  import { theme } from '$utils/theme';
  import Color from 'color';
  import { TextBlock } from 'fluent-svelte';

  export let title: string;
</script>

<div
  class="wrapper"
  style="
    --bg-color: {Color(theme($themeMode).color.neutral[$themeMode][$themeMode === 'light' ? 100 : 200])
    .alpha($themeMode === 'light' ? 0.3 : 0.1)
    .string()};
  "
  class:compact={$compactMode}
>
  <div class="top-bar">
    <TextBlock style="font-weight: 600;">{title}</TextBlock>
  </div>
  <div class="content-area">
    <slot />
  </div>
</div>

<style>
  div.wrapper {
    --border-color: var(--color-neutral-light-200);
    --color: var(--color-neutral-light-1400);
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 42px 1fr;
    box-shadow: var(--border-color) 0px 0px 0px 1px inset;
    background-color: var(--bg-color);
    border-radius: var(--fds-control-corner-radius);
    box-sizing: border-box;
    overflow: auto;
  }
  @media (prefers-color-scheme: dark) {
    div.wrapper {
      --border-color: var(--color-neutral-dark-200);
      --color: var(--color-neutral-dark-1400);
    }
  }
  div.wrapper.compact {
    grid-template-rows: 36px 1fr;
  }

  div.top-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    padding: 0 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--color);
  }

  div.content-area {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: auto;
  }
</style>
