<script lang="ts">
  import { browser } from '$app/environment';
  import { ProgressRing } from 'fluent-svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: if (browser) document.title = `Fathom Analytics - Cristata`;
</script>

<div class="wrapper">
  <div class="spinner-zone">
    <ProgressRing />
  </div>
  <iframe title="fathom" src={data?.fathomDashboard} frameborder="0" />
</div>

<style>
  .wrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: 'a';
    align-items: center;
    justify-content: center;
  }

  .spinner-zone,
  iframe {
    grid-area: a;
    width: 100%;
    height: 100%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
</style>
