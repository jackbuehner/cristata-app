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

<style>
  :root {
    --fds-accent-dark-1: 253, 54%, 47%;
    --fds-accent-light-2: 253, 49%, 80%;
  }
</style>
