<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Appbar } from '$components/Appbar';
  import NavigationPane from '$lib/main-layout/NavigationPane.svelte';
  import OfflineNotice from '$lib/main-layout/OfflineNotice.svelte';
  import Titlebar from '$lib/main-layout/Titlebar.svelte';
  import { Root } from '$react/Root';
  import { motionMode } from '$stores/motionMode';
  import { themeMode } from '$stores/themeMode';
  import { theme as themeFunction } from '$utils/theme';
  import type { BeforeNavigate } from '@sveltejs/kit';
  import { ProgressRing, TextBlock } from 'fluent-svelte';
  import NProgress from 'nprogress';
  import { toCustomPropertiesString } from 'object-to-css-variables';
  import { onDestroy, onMount } from 'svelte';
  import { used } from 'svelte-preprocess-react';
  import { RouterProvider } from 'svelte-preprocess-react/react-router';
  import { expoOut, linear } from 'svelte/easing';
  import { fly } from 'svelte/transition';
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
    ($page.url.pathname.includes('/cms/') &&
      !$page.url.pathname.includes('/cms/workflow') &&
      !($page.url.pathname.includes('/cms/collection/') && $page.url.pathname.split('/').length === 5)) ||
    $page.url.pathname.includes('/configuration/');

  // variables for page transitions
  let unique = {};
  let waiting = false;
  let showSpinner = false;
  const delay = 130;
  const duration = 270;

  /**
   * Trigger the page transition by re-rendering the content div (which contains the slot)
   */
  function triggerTransition() {
    unique = {}; // every {} is unique; {} === {} evaluates to false
  }

  /**
   * Ensure that `waiting` is `false` after skipping a transition
   */
  function handleEndTransition() {
    waiting = false;
  }

  /**
   * Triggers the page transition unless skip conditions are met (conditions are defined in the function).
   */
  function handleTransition(navigation: BeforeNavigate) {
    // skip if user wants no motion
    if ($motionMode === 'reduced') return handleEndTransition();

    // skip transition if pathname does not change
    if (navigation.from?.url.pathname === navigation.to?.url.pathname) return handleEndTransition();

    // skip transition if clicking between photos in the library
    if (
      navigation.from?.url.pathname.includes(`/paladin-news/cms/photos/library`) &&
      navigation.to?.url.pathname.includes(`/paladin-news/cms/photos/library`)
    ) {
      return handleEndTransition();
    }

    // animate a fancy transition between pages
    triggerTransition();
  }

  beforeNavigate(handleTransition);
  afterNavigate(handleEndTransition);

  function fade(node: Element, { delay = 0, duration = 400, easing: easing$1 = linear } = {}) {
    const o = +getComputedStyle(node).opacity;

    waiting = true;
    setTimeout(() => {
      // show the loading spinner if the next page still has not loaded
      if (waiting) showSpinner = true;
    }, duration + 800);

    return {
      delay,
      duration,
      easing: easing$1,
      css: (t: number) => `opacity: ${t * o}`,
    };
  }
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
      <div id="app" class:tauri={data.tauri}>
        <!-- side navigation -->
        {#if window?.name === ''}
          <NavigationPane {data} />
        {/if}

        <!-- the rest of the content -->
        <!-- svelte-ignore missing-declaration -->
        <div id="content-outer" class:tauri={data.tauri}>
          {#key unique}
            <div style="height: 100%; width: 100%;">
              {#if !waiting}
                {#if showAppBar}
                  <div out:fade={{ duration: delay }}>
                    <react:Appbar />
                  </div>
                {/if}
                <div
                  id="content"
                  in:fly={{ y: 40, duration, easing: expoOut, delay }}
                  out:fade={{ duration: delay }}
                >
                  <slot />
                </div>
              {:else if showSpinner}
                <div
                  id="content"
                  style="display: flex; flex-direction: column; gap: 14px; align-items: center; justify-content: center;"
                >
                  <ProgressRing size={32} />
                  <TextBlock variant="bodyStrong">Please wait</TextBlock>
                </div>
              {/if}
            </div>
          {/key}
        </div>
      </div>
    </div>
  </react:RouterProvider>
</react:Root>

<div>
  <style>
    .root-splash-wrapper {
      display: none !important;
    }
  </style>
</div>

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
    overflow: hidden;
    width: 100%;
    height: 100%;
    /* display: flex;
    flex-direction: column; */
    background-color: #ffffff;
    color: var(--color-neutral-light-1400);
    border-radius: 6px 0 0 0;
    /* position: relative; */
  }
  div#content-outer.tauri {
    background-color: rgba(255, 255, 255, 0.7);
  }

  div#content {
    /* position: absolute; */
    /* top: 0; */
    /* right: 0;
    bottom: 0;
    left: 0; */
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
    div#content-outer.tauri {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }

  div#app.tauri {
    background-color: transparent;
  }
</style>
