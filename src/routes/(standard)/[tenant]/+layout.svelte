<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Appbar } from '$components/Appbar';
  import NavigationPane from '$lib/main-layout/NavigationPane.svelte';
  import OfflineNotice from '$lib/main-layout/OfflineNotice.svelte';
  import Titlebar from '$lib/main-layout/Titlebar.svelte';
  import { Root } from '$react/Root';
  import { themeMode } from '$stores/themeMode';
  import { theme as themeFunction } from '$utils/theme';
  import NProgress from 'nprogress';
  import { toCustomPropertiesString } from 'object-to-css-variables';
  import { onDestroy, onMount } from 'svelte';
  import { used } from 'svelte-preprocess-react';
  import { RouterProvider } from 'svelte-preprocess-react/react-router';
  import { setAppSearchShown } from '../../../redux/slices/appbarSlice';
  import { store } from '../../../redux/store';
  import type { LayoutData } from './$types';

  // configure the navigation progress bar
  NProgress.configure({
    parent: 'body',
    easing: 'ease',
    speed: 500,
    trickle: true,
    trickleSpeed: 200,
    showSpinner: false,
  });

  // show progress bar on page navigate
  beforeNavigate(() => {
    NProgress.start();
  });

  // hide progress bar on navigation end
  afterNavigate(() => {
    NProgress.done();
  });

  export let data: LayoutData;

  // get the theme
  $: theme = themeFunction($themeMode);
  $: themeVars = toCustomPropertiesString(theme);

  // listen for when user changes system theme preference
  function setCorrectThemeMode(evt: MediaQueryListEvent) {
    if (evt.matches) $themeMode = 'dark';
    else $themeMode = 'light';
  }
  onMount(() => {
    if (browser)
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setCorrectThemeMode);
  });
  onDestroy(() => {
    if (browser)
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setCorrectThemeMode);
  });

  // inject the theme variables as custom properties
  $: {
    if (themeVars && browser) {
      const styleElem = (() => {
        const existing = document.querySelector('style#theme');
        if (existing) return existing;
        const newElem = document.createElement('style');
        newElem.id = 'theme';
        document.head.appendChild(newElem);
        return newElem;
      })();
      styleElem.innerHTML = `:root { ${themeVars} }`;
    }
  }

  // close search after navigate
  afterNavigate(() => {
    store.dispatch(setAppSearchShown(false));
  });

  used(RouterProvider);

  const isOffline = browser && navigator.onLine === false;

  // store whether the nav is shown
  let isNavVisible = false;
  function setIsNavVisible(result: boolean) {
    isNavVisible = result;
  }

  // whether the app bar is visible
  $: showAppBar =
    $page.url.pathname.includes('/cms/') ||
    $page.url.pathname.includes('/teams') ||
    $page.url.pathname.includes('/embed/') ||
    $page.url.pathname.includes('/configuration/');
</script>

<react:Root>
  <react:RouterProvider value={{ url: $page.url, params: $page.params, goto }}>
    <div id="frame">
      <!-- title bar -->
      <Titlebar {data} />

      <!-- offline notice -->
      {#if isOffline}
        <OfflineNotice />
      {/if}

      <!-- side navigation and main content -->
      <!-- TODO: Make a component with two slots: one that takes the navigation and another that takes the content. Use the component in layouts for the routes that are used here. -->
      <div id="app">
        <!-- side navigation -->
        {#if window?.name === ''}
          <NavigationPane {data} />
        {/if}

        <!-- the rest of the content -->
        <div id="content-outer">
          {#if showAppBar}
            <react:Appbar />
          {/if}
          <div id="content">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </react:RouterProvider>
</react:Root>

<style>
  div#frame {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: fixed;
  }

  @media print {
    div#frame {
      height: 100% !important;
    }
  }

  div#app {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 0;
    flex-grow: 1;
    flex-shrink: 1;
    background-color: #f3f3f3;
  }

  div#content-outer {
    overflow: auto;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    color: var(--color-neutral-light-1400);
    border-radius: 6px 0 0 0;
  }

  div#content {
    overflow: auto;
    width: 100%;
    height: 100%;
  }
  @media (prefers-color-scheme: dark) {
    div#app {
      background-color: #202020;
    }

    div#content-outer {
      background-color: #272727;
      color: var(--color-neutral-dark-1400);
    }
  }
</style>
