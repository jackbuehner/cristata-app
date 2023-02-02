<script lang="ts">
  import { Button } from 'fluent-svelte';

  export let href: string | undefined = undefined;
  export let compact = false;
</script>

<Button
  on:click
  {href}
  variant="hyperlink"
  style="
    height: {compact ? 24 : 30}px;
    color: currentColor;
    border: 1px solid var(--fds-divider-stroke-default);
    font-size: 0.75rem;
    padding: 0 {compact ? 6 : 10}px;
    cursor: default;
  "
>
  <slot />
</Button>
