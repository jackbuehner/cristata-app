<script lang="ts">
  import { used } from 'svelte-preprocess-react';
  import { RouterProvider } from 'svelte-preprocess-react/react-router';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Root } from '$react/Root';
  import { Appbar } from '$components/Appbar';
  import { Titlebar } from '$components/Titlebar';
  import { SideNavigation } from '$components/SideNavigation';
  import { CmsNavigation } from '$react/CMS/CmsNavigation';
  import { TeamsNav as TeamsNavigation } from '$react/teams/TeamsNav';
  import { ProfileSideNavSub as ProfilesNavigation } from '$react/profile/ProfileSideNavSub';
  import { PlaygroundNavigation } from '$react/playground/PlaygroundNavigation';
  import { ConfigurationNavigation } from '$react/configuration/ConfigurationNavigation/ConfigurationNavigation';
  import { toCustomPropertiesString } from 'object-to-css-variables';
  import { theme as themeFunction } from '$utils/theme';
  import { onMount, onDestroy } from 'svelte';
  import OfflineNotice from '$lib/main-layout/OfflineNotice.svelte';

  try {
    const i = import('@material-ui/core/CircularProgress');
  } catch (error) {
    console.error(error);
  }

  // get the theme
  let themeMode = window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  $: theme = themeFunction(themeMode);
  $: themeVars = toCustomPropertiesString(theme);

  // listen for when user changes system theme preference
  function setCorrectThemeMode(evt: MediaQueryListEvent) {
    if (evt.matches) themeMode = 'dark';
    else themeMode = 'light';
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

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

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
    <div id="frame" class:withCustomTitlebar={isCustomTitlebarVisible}>
      <!-- title bar for when in pwa app mode -->
      {#if isCustomTitlebarVisible}
        <react:Titlebar />
      {/if}

      <!-- app bar with actions, title, search, etc. -->
      <react:Appbar />

      <!-- offline notice -->
      {#if isOffline}
        <OfflineNotice />
      {/if}

      <!-- side navigation and main content -->
      <div id="app">
        <!-- side navigation -->
        {#if window?.name === ''}
          <react:SideNavigation children={() => null} {isNavVisible} {setIsNavVisible}>
            {#if $page.url.pathname.replace(`/${tenant}/`, ``).indexOf(`cms/`) === 0}
              <react:CmsNavigation setIsNavVisibleM={setIsNavVisible} />
            {:else if $page.url.pathname.replace(`/${tenant}/`, ``).indexOf(`profile/`) === 0}
              <react:ProfilesNavigation setIsNavVisibleM={setIsNavVisible} />
            {:else if $page.url.pathname.replace(`/${tenant}/`, ``).indexOf(`teams/`) === 0}
              <react:TeamsNavigation setIsNavVisibleM={setIsNavVisible} />
            {:else if $page.url.pathname.replace(`/${tenant}/`, ``) === 'playground'}
              <react:PlaygroundNavigation />
            {:else if $page.url.pathname.replace(`/${tenant}/`, ``).indexOf(`configuration/`) === 0}
              <react:ConfigurationNavigation />
            {/if}
          </react:SideNavigation>
        {/if}

        <!-- the rest of the content -->
        <div id="content">
          <slot />
        </div>
      </div>
    </div>
  </react:RouterProvider>
</react:Root>

<style>
  :global(.root-splash-wrapper) {
    display: none !important;
  }

  div#frame {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: fixed;
  }

  div#frame.withCustomTitlebar {
    height: calc(100% - env(titlebar-area-height, 33px));
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
  }
  @media (prefers-color-scheme: dark) {
    div#content {
      background-color: var(--color-neutral-dark-100);
      color: var(--color-neutral-dark-1400);
    }
  }
</style>
