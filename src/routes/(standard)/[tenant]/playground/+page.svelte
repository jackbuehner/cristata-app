<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { Playground as PlaygroundPage } from '$react/playground';
  import { playground, playgroundActions } from '$stores/playground';
  import { themeMode } from '$stores/themeMode';
  import { Button, InfoBar, Tooltip } from 'fluent-svelte';

  function setThemeMode(mode: unknown) {
    if (mode === 'light' || mode === 'dark') {
      $themeMode = mode;
    }
  }

  $: console.log($playground);
</script>

<div class="wrapper">
  <div>
    <PageTitle fullWidth>Data playground</PageTitle>
    <ActionRow fullWidth>
      <Tooltip text="Execute Query (Ctrl-Enter)" offset={4} placement="bottom" alignment="start">
        <Button
          variant="accent"
          on:click={() => $playgroundActions.handleEditorRunQuery?.()}
          disabled={!$playgroundActions.handleEditorRunQuery || !$playground.schema}
        >
          <FluentIcon name="Play16Regular" mode="buttonIconLeft" />
          Execute query
        </Button>
      </Tooltip>
      <Tooltip text="Prettify Query (Shift-Ctrl-P)" offset={4} placement="bottom" alignment="center">
        <Button
          on:click={() => $playgroundActions.handlePrettifyQuery?.()}
          disabled={!$playgroundActions.handlePrettifyQuery}
        >
          Prettify query
        </Button>
      </Tooltip>
      <Tooltip text="Toggle Docs" offset={4} placement="bottom" alignment="center">
        <Button
          on:click={() => $playgroundActions.handleToggleDocs?.()}
          disabled={!$playgroundActions.handleToggleDocs || !$playground.schema}
        >
          {#if $playground.state?.docExplorerOpen}
            Hide documentation
          {:else}
            Show documentation
          {/if}
        </Button>
      </Tooltip>
    </ActionRow>
    <div class="data-danger">
      <InfoBar title="Heads up!" severity="caution">
        Cristata's GraphQL Explorer makes use of your <b>real, live, production data</b>.
      </InfoBar>
    </div>
  </div>
  <react:PlaygroundPage {setThemeMode} />
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .data-danger {
    margin: 20px;
  }
</style>
