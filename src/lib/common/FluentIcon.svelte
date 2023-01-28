<script lang="ts">
  import { camelToDashCase } from '$utils/camelToDashCase';
  import * as icons from '@fluentui/svg-icons';

  export let name: string;
  $: type = name.slice(-7) === 'Regular' ? 'regular' : 'filled';
  $: size = type === 'regular' ? name.slice(-9, -7) : name.slice(-8, -6);
  $: pascalName = type === 'regular' ? name.slice(0, -9) : name.slice(0, -8);
  $: snakeName = camelToDashCase(pascalName).replaceAll('-', '_');
  $: iconName = `${snakeName}_${size}_${type}`;

  type FluentIcon = keyof typeof icons;
  function isFluentIconName(str: string): str is FluentIcon {
    const iconNames = Object.keys(icons);
    return iconNames.includes(str);
  }

  export let mode: 'regular' | 'buttonIconLeft' | 'buttonIconRight' | 'bodyStrongLeft' = 'regular';
</script>

{#if isFluentIconName(iconName)}
  {#if mode === 'regular'}
    {@html icons[iconName]}
  {:else if mode === 'buttonIconLeft'}
    <span style="margin: 0 12px 0 0;" class="button-icon">
      {@html icons[iconName]}
    </span>
  {:else if mode === 'buttonIconRight'}
    <span style="margin: 0 0 0 12px;" class="button-icon">
      {@html icons[iconName]}
    </span>
  {:else if mode === 'bodyStrongLeft'}
    <span style="margin: 0 6px 0 0;" class="body-text-icon">
      {@html icons[iconName]}
    </span>
  {/if}
{/if}

<style>
  .button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .body-text-icon {
    vertical-align: middle;
  }
  .button-icon :global(svg),
  .body-text-icon :global(svg) {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
</style>
