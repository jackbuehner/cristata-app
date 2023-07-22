<script lang="ts">
  import { SchemaField } from '$lib/common/Field';
  import type { AwarenessUser, YStore } from '$utils/createYStore';
  import { Button, ContentDialog, InfoBar } from 'fluent-svelte';

  export let open = false;

  export let ydoc: YStore['ydoc'];
  export let wsProvider: YStore['wsProvider'];
  export let disabled = false;
  export let user: AwarenessUser;
  export let fullSharedData: YStore['fullSharedData'];
  export let fieldStyle = '';

  export let handleAction: (() => Promise<void>) | undefined = undefined;
</script>

<ContentDialog title="Share document" trapFocus={false} bind:open size="standard">
  <InfoBar severity="caution" title="Changes are immediate" closable={false}>
    Changes you make will immediately take effect. There is no save/cancel process.
  </InfoBar>

  <br />

  <SchemaField
    key="permissions.users"
    def={{
      type: ['[User]', ['ObjectId']],
      field: {
        label: 'People',
      },
      docs: undefined,
      modifiable: true,
    }}
    {ydoc}
    {disabled}
    {wsProvider}
    {user}
    {fullSharedData}
    style={fieldStyle}
  />

  <SchemaField
    key="permissions.teams"
    def={{
      type: ['[Team]', ['ObjectId']],
      field: {
        label: 'Teams',
      },
      docs: undefined,
      modifiable: true,
    }}
    {ydoc}
    {disabled}
    {wsProvider}
    {user}
    {fullSharedData}
    style={fieldStyle}
  />

  <svelte:fragment slot="footer">
    <Button
      variant="accent"
      on:click={async () => {
        await handleAction?.();
        open = false;
      }}
    >
      Done
    </Button>
  </svelte:fragment>
</ContentDialog>
