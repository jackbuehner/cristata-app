<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Appbar } from '$components/Appbar';
  import { SideNavigation } from '$components/SideNavigation';
  import { Titlebar as TitlebarR } from '$components/Titlebar';
  import NavigationView from '$lib/common/NavigationView.svelte';
  import NavigationPane from '$lib/main-layout/NavigationPane.svelte';
  import OfflineNotice from '$lib/main-layout/OfflineNotice.svelte';
  import Titlebar from '$lib/main-layout/Titlebar.svelte';
  import { CmsNavigation } from '$react/CMS/CmsNavigation';
  import { ConfigurationNavigation } from '$react/configuration/ConfigurationNavigation/ConfigurationNavigation';
  import { PlaygroundNavigation } from '$react/playground/PlaygroundNavigation';
  import { ProfileSideNavSub as ProfilesNavigation } from '$react/profile/ProfileSideNavSub';
  import { Root } from '$react/Root';
  import { TeamsNav as TeamsNavigation } from '$react/teams/TeamsNav';
  import { themeMode } from '$stores/themeMode';
  import { notEmpty } from '$utils/notEmpty';
  import { theme as themeFunction } from '$utils/theme';
  import { toCustomPropertiesString } from 'object-to-css-variables';
  import { onDestroy, onMount } from 'svelte';
  import { used } from 'svelte-preprocess-react';
  import { RouterProvider } from 'svelte-preprocess-react/react-router';
  import type { LayoutData } from './$types';

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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setCorrectThemeMode);
  });
  onDestroy(() => {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setCorrectThemeMode);
  });

  // inject the theme variables as custom properties
  $: {
    if (themeVars && window) {
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

  used(RouterProvider);

  const isOffline = navigator.onLine === false;

  const tenant = location.pathname.split('/')[1] || $page.params.tenant;

  // store whether the nav is shown
  let isNavVisible = false;
  function setIsNavVisible(result: boolean) {
    isNavVisible = result;
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
      <div id="app">
        <!-- side navigation -->
        {#if window?.name === ''}
          <NavigationPane {data} />
          <react:SideNavigation children={() => null} {isNavVisible} {setIsNavVisible}>
            {#if $page.url.pathname.replace(`/${tenant}/`, ``).indexOf(`teams`) === 0}
              <react:TeamsNavigation setIsNavVisibleM={setIsNavVisible} />
            {:else if $page.url.pathname.replace(`/${tenant}/`, ``) === 'playground'}
              <react:PlaygroundNavigation />
            {/if}
          </react:SideNavigation>
        {/if}

        <!-- the rest of the content -->
        <div id="content" style="display: flex; flex-direction: column;">
          <react:Appbar />
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

  @media (max-width: 600px) {
    div#app {
      display: block;
    }
  }

  div#content {
    overflow: auto;
    background-color: 'white';
    color: var(--color-neutral-light-1400);
    width: 100%;
    height: 100%;
    border-radius: 6px 0 0 0;
    background-color: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    div#app {
      background-color: #202020;
    }

    div#content {
      background-color: #272727;
      color: var(--color-neutral-dark-1400);
    }
  }
</style>
