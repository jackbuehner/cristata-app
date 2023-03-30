<script lang="ts">
  import { Chip } from '$lib/common/Chip';
  import { compactMode } from '$stores/compactMode';
  import { themeMode } from '$stores/themeMode';
  import { theme, type colorType } from '$utils/theme/theme';
  import Color from 'color';
  import { TextBlock } from 'fluent-svelte';

  export let label: string = '';
  export let href: string | undefined = undefined;
  export let chip: { label?: string; value: string | number; color?: colorType } | undefined = undefined;
</script>

<div
  class="container"
  style="
    --bg-color: {$themeMode === 'dark'
    ? Color(theme($themeMode).color.neutral.dark[100]).lighten(0.2).string()
    : Color('#ffffff').darken(0.02).string()};
  "
>
  {#if label}
    <div class="label" class:compact={$compactMode}>{label}</div>
  {/if}

  {#if href}
    <a class="note" {href}><TextBlock tag="span" style="text-decoration: inherit"><slot /></TextBlock></a>
  {:else}
    <div class="note"><TextBlock tag="span"><slot /></TextBlock></div>
  {/if}

  {#if chip}
    <div class="chips-wrapper" class:compact={$compactMode}>
      <Chip color={chip.color} compact={$compactMode}>
        {chip.label || chip.value}
      </Chip>
    </div>
  {/if}
</div>

<style>
  .container {
    --border-color: var(--color-neutral-light-200);
    display: block;
    box-shadow: var(--border-color) 0px 0px 0px 1px inset;
    background-color: var(--bg-color);
    border-radius: var(--fds-control-corner-radius);
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
  }
  @media (prefers-color-scheme: dark) {
    .container {
      --border-color: var(--color-neutral-dark-200);
    }
  }

  .label {
    font-family: var(--fds-font-family-text);
    font-size: 12px;
    font-weight: 400;
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 1.3px;
    color: var(--color-neutral-light-1000);
  }
  .label.compact {
    margin-bottom: 4px;
  }
  @media (prefers-color-scheme: dark) {
    .label {
      color: var(--color-neutral-dark-1000);
    }
  }

  .note {
    display: block;
    text-decoration: none;
    white-space: pre-line;
    margin: 0;
  }

  a.note:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .chips-wrapper {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin: 12px 0 0 0;
    flex-wrap: wrap;
  }
  .chips-wrapper.compact {
    gap: 3px;
    margin-top: 8px;
  }
</style>
