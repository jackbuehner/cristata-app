<script lang="ts">
  import { used } from 'svelte-preprocess-react';
  import { RouterProvider } from 'svelte-preprocess-react/react-router';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  used(RouterProvider);
</script>

<react:RouterProvider value={{ url: $page.url, params: $page.params, goto }}>
  <slot />
</react:RouterProvider>

<style>
  :global(.root-splash-wrapper) {
    display: none !important;
  }
</style>
