<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { PageTitle } from '$lib/common/PageTitle';
  import { Button, InfoBar } from 'fluent-svelte';

  export let data;

  $: if (browser) document.title = 'Secrets';
</script>

<div class="wrapper">
  <div class="header">
    <PageTitle>Secrets</PageTitle>

    <section>
      <InfoBar title="Looking for Fathom secrets?" closable={false}>
        Secret configuration for Fathom Analytics has moved to the Fathom Analytics app settings page.
        <Button
          slot="action"
          on:click={() => {
            goto(`/${data.authUser.tenant}/configuration/app/fathom-analytics`);
          }}
        >
          Go to Fathom settings
        </Button>
      </InfoBar>
    </section>
  </div>
</div>

<style>
  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }
</style>
