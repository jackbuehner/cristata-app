<script lang="ts">
  import { ReferenceMany } from '$components/ContentField';
  import { FieldWrapper } from '$lib/common/Field';
  import { TextBlock } from 'fluent-svelte';

  export let users: (string | 0)[] | undefined = [];
  export let teams: (string | 0)[] | undefined = [];

  type PopulatedValue = { _id: string; label: string };
  function handleUsersChange(newValues: PopulatedValue[]) {
    users = newValues.map((value) => (value._id === 'any' ? 0 : value._id));
  }
  function handleTeamsChange(newValues: PopulatedValue[]) {
    teams = newValues.map((value) => (value._id === 'any' ? 0 : value._id));
  }
</script>

<article>
  <div class="card-label">
    <TextBlock variant="body" tag="span"><slot /></TextBlock>
  </div>

  <FieldWrapper label="Users" forId="">
    <react:ReferenceMany
      id="test"
      label="__in-select"
      collection="User"
      values={(users || []).map((value) =>
        value === 0 ? { _id: 'any', label: 'Any user' } : { _id: value }
      ) || []}
      injectOptions={[{ value: 'any', label: 'Any user' }]}
      onChange={handleUsersChange}
    />
  </FieldWrapper>

  <FieldWrapper label="Teams" forId="">
    <react:ReferenceMany
      id="test"
      label="__in-select"
      collection="Team"
      values={(teams || []).map((value) =>
        value === 0 ? { _id: 'any', label: 'Any team' } : { _id: value }
      ) || []}
      injectOptions={[{ value: 'any', label: 'Any team' }]}
      onChange={handleTeamsChange}
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
