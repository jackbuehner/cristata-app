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
</script>

{#if isFluentIconName(iconName)}
  {@html icons[iconName]}
{/if}
