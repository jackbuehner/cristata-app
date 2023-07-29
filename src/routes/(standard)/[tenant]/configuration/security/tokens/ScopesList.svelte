<script lang="ts">
  import { StatelessCheckbox } from '$lib/common/Checkbox';

  export let scopes: (string | null)[];

  const scopesList = [['admin', 'Everything']];
</script>

{#each scopesList as [scopeId, scopeLabel]}
  <StatelessCheckbox
    checked={scopes.includes(scopeId)}
    on:change={(evt) => {
      if (evt.detail.checked) {
        scopes = [...new Set([...scopes, scopeId])];
      } else {
        scopes = scopes.filter((_scope) => _scope !== scopeId);
      }
    }}
  >
    {scopeLabel}
  </StatelessCheckbox>
{/each}
