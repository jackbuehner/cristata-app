<script lang="ts">
  import { FieldWrapper } from '$lib/common/Field';
  import { SelectMany, type Option } from '$lib/common/Select';
  import { TextBlock } from 'fluent-svelte';

  export let users: Option[] = [];
  export let teams: Option[] = [];
</script>

<article>
  <div class="card-label">
    <TextBlock variant="body" tag="span"><slot /></TextBlock>
  </div>

  <FieldWrapper label="Users" forId="">
    <SelectMany
      reference={{
        collection: 'User',
      }}
      bind:selectedOptions={users}
      options={[{ _id: 'any', label: 'Any user' }]}
    />
  </FieldWrapper>

  <FieldWrapper label="Teams" forId="">
    <SelectMany
      reference={{
        collection: 'Team',
      }}
      bind:selectedOptions={teams}
    />
  </FieldWrapper>
</article>

<style>
  article {
    border: 1px solid;
    border-color: var(--fds-control-border-default);
    background-color: var(--fds-card-background-secondary);
    border-radius: var(--fds-control-corner-radius);
    padding: 20px;
  }

  .card-label {
    margin: 0 0 15px 0;
  }

  .card-label > :global(.text-block) {
    font-size: 16px !important;
    font-weight: 600 !important;
  }
</style>
