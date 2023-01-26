<script lang="ts">
  import { Button, Flyout, IconButton, PersonPicture, TextBlock } from 'fluent-svelte';
  import type { LayoutData } from '../../routes/(standard)/[tenant]/$types';

  export let data: LayoutData;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const customTitlebarOffsetX = navigator.windowControlsOverlay?.getBoundingClientRect?.().x || 0;

  const initials = data.authUser.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  // right controls: <- -> | title     […] [_] [■] [X]
  // left controls:  [X] [_] [■] | <- -> | title     […]
</script>

<div class="titlebar">
  <div class="left">
    <svg xmlns="http://www.w3.org/2000/svg" width="41.57" height="26" viewBox="0 0 31.1775 36">
      <path
        d="m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z"
      />
      <path
        d="M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z"
      />
    </svg>
    <TextBlock variant="caption">Cristata (Preview) – {data.authUser.tenant}</TextBlock>
  </div>
  <div class="right">
    <Flyout placement="bottom" alignment="end">
      <IconButton style="padding: 2px; margin-right: 16px;">
        <PersonPicture size={28}>{initials}</PersonPicture>
      </IconButton>
      <svelte:fragment slot="flyout">
        <PersonPicture size={60}>{initials}</PersonPicture>
        <div>
          <TextBlock variant="bodyLarge">{data.authUser.name}</TextBlock>
        </div>
        <div>
          <TextBlock variant="body">{data.authUser.name}</TextBlock>
        </div>
        <div>
          <Button>View profile</Button>
        </div>
      </svelte:fragment>
    </Flyout>
  </div>
</div>

<style>
  .titlebar {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
    left: env(titlebar-area-x, 0);
    top: env(titlebar-area-y, 0);
    width: env(titlebar-area-width, 100%);
    height: env(titlebar-area-height, 33px);
    -webkit-app-region: drag;
    app-region: drag;
    user-select: none;
    justify-content: space-between;
    background-color: #f3f3f3;
  }

  .left {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  .right {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }

  svg {
    width: 16px;
    height: 16px;
    margin: 0 16px;
    fill: var(--color-primary-800);
  }
  @media (prefers-color-scheme: dark) {
    .titlebar {
      background-color: #202020;
    }

    svg {
      fill: var(--color-primary-300);
    }
  }
</style>
