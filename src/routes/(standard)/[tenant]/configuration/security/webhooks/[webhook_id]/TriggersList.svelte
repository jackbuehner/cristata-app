<script lang="ts">
  import { StatelessCheckbox } from '$lib/common/Checkbox';

  export let triggers: (string | null)[];

  const triggerList = ['modify', 'publish', 'unpublish', 'delete'];
</script>

{#each triggerList as trigger}
  <StatelessCheckbox
    checked={triggers.includes(trigger)}
    on:change={(evt) => {
      if (evt.detail.checked) {
        triggers = [...new Set([...triggers, trigger])];
      } else {
        triggers = triggers.filter((_trigger) => _trigger !== trigger);
      }
    }}
  >
    {trigger}
  </StatelessCheckbox>
{/each}
