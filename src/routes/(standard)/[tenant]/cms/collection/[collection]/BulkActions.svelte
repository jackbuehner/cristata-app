<script lang="ts">
  export let show = false;
</script>

<div class="actions" class:show>
  <slot />
</div>

<style>
  div.actions {
    position: absolute;
    bottom: -60px;
    opacity: 0;
    transition: 240ms;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--fds-solid-background-quarternary);
    /* background-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][300]).alpha(0.3).string()}; */
    backdrop-filter: blur(20px);
    border-radius: var(--fds-control-corner-radius);
    display: flex;
    flex-direction: row;
    box-shadow: 0px 25.6px 57.6px rgb(0 0 0 / 14%), 0px 0px 16.4px rgb(0 0 0 / 12%);
    z-index: 1;
    height: 40px;
  }

  div.actions.show {
    bottom: 0px;
    opacity: 1;
  }

  div.actions :global(.button) {
    border-radius: 0px;
    white-space: nowrap;
  }
  div.actions :global(.button:first-child) {
    border-top-left-radius: var(--fds-control-corner-radius);
    border-bottom-left-radius: var(--fds-control-corner-radius);
  }
  div.actions :global(.button:last-child) {
    border-top-right-radius: var(--fds-control-corner-radius);
    border-bottom-right-radius: var(--fds-control-corner-radius);
  }
</style>
