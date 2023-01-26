<script lang="ts">
  import 'fluent-svelte/theme.css';
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';

  let ReloadPrompt: ConstructorOfATypedSvelteComponent;
  onMount(async () => {
    pwaInfo && (ReloadPrompt = (await import('$lib/pwa/ReloadPrompt.svelte')).default);
  });

  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
  {@html webManifest}
</svelte:head>

<slot />

{#if ReloadPrompt}
  <svelte:component this={ReloadPrompt} />
{/if}
