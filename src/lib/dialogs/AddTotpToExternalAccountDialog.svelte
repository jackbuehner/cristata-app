<script lang="ts">
  import { ModifyExternalAccount, type ExternalAccountModifyInputMfa } from '$graphql/graphql';
  import { FieldWrapper } from '$lib/common/Field';
  import { server } from '$utils/constants';
  import { Button, ContentDialog, InfoBar, ProgressRing } from 'fluent-svelte';
  import { print } from 'graphql';
  import jsQR from 'jsqr';

  export let open = false;

  export let tenant: string;

  export let _id: string;

  export let handleAction: (() => Promise<void>) | undefined = undefined;
  export let handleSumbit: ((_id: string) => Promise<void>) | undefined = undefined;
  export let handleCancel: (() => Promise<void>) | undefined = undefined;

  let error: string;
  let loadingSubmit = false;
  let loadingCancel = false;

  let dropZoneActive = false;

  async function saveChanges(input: ExternalAccountModifyInputMfa): Promise<false | string> {
    return await fetch(`${server.location}/v3/${tenant}?EditExternalAccount`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(ModifyExternalAccount),
        variables: {
          _id,
          input: {
            mfa: input,
          },
        },
      }),
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');

        if (contentType && contentType.indexOf('application/json') !== -1) {
          const json = await res.json();

          if (json.errors) {
            error = json.errors?.[0]?.message || JSON.stringify(json.errors?.[0] || 'Unknown error');
            return false;
          }

          if (res.ok) {
            return json.data?.externalAccountCreate?._id || true;
          }

          error = `${res.status} ${res.statusText}`;
          return false;
        }
      })
      .catch((err) => {
        error = err.message || JSON.stringify(err || 'Unknown error');
        return false;
      });
  }

  function processFile(file: File) {
    loadingSubmit = true;

    const url = URL.createObjectURL(file);
    const img = new Image();
    // const canvas = document.createElement('canvas');

    img.onload = function () {
      // free memory held by Object URL
      URL.revokeObjectURL(img.src);

      // draw image onto canvas (lazy method™)
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d')?.drawImage(img, 0, 0);

      // create image data from the canvas with the specified dimensions
      const imageData = canvas.getContext('2d')?.getImageData(0, 0, img.width, img.height);

      // parse the QR code from the image data
      if (imageData) {
        const code = jsQR(imageData.data, img.width, img.height);
        if (code) {
          const codeURL = new URL(code.data);

          const type = codeURL.pathname.split('/')[2];
          if (type.toLowerCase() !== 'totp') return;

          const labelAndUser = codeURL.pathname.split('/').slice(-1)[0];
          const [fallbackIssuer, user] = labelAndUser.split(':');

          // save the totp code data to the database
          saveChanges({
            algorithm: 'SHA1', // codeURL.searchParams.get('algorithm')
            digits: parseInt(codeURL.searchParams.get('digits') || '6'),
            issuer: codeURL.searchParams.get('issuer') || fallbackIssuer,
            period: parseInt(codeURL.searchParams.get('period') || '30'),
            secret: codeURL.searchParams.get('secret'), // `secret` will be encrypted by the server
            type: type,
            user,
          })
            .finally(() => {
              loadingSubmit = false;
            })
            .then(async (success) => {
              if (success) {
                await handleAction?.();
                await handleSumbit?.(success);
                open = false;
              }
            });
        } else {
          error = 'The provided QR code is not a valid TOTP code QR code.';
          loadingSubmit = false;
        }
      }
    };

    img.src = url;
  }

  let canvas: HTMLCanvasElement;
  let uploadInput: HTMLInputElement;
</script>

<ContentDialog title="Add TOTP code" bind:open size="standard">
  {#if error}
    <div class="error">
      <InfoBar severity="critical" title="Failed to save changes">{error}</InfoBar>
    </div>
  {/if}

  <FieldWrapper
    label="QR code"
    forId="qr"
    description="Upload a screenshot or picture of the QR code that this service provided. We'll parse it and add it to Cristata."
  >
    <div
      class="dropzone"
      class:dropZoneActive
      on:dragend={() => {
        dropZoneActive = false;
      }}
      on:drop={(evt) => {
        dropZoneActive = false;

        // prevent default behavior (Prevent file from being opened)
        evt.preventDefault();

        // get the file blob
        let file = undefined;
        if (evt.dataTransfer?.items) {
          // Use DataTransferItemList interface to access the file(s)
          [...evt.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
              const _file = item.getAsFile();
              if (_file) file = _file;
            }
          });
        } else if (evt.dataTransfer?.files) {
          // Use DataTransfer interface to access the file(s)
          [...evt.dataTransfer.files].forEach((_file, i) => {
            if (_file) file = _file;
          });
        }

        // load the image into a canvas so we can get a Uint8ClampedArray of the image
        if (file) processFile(file);
      }}
      on:dragover={(evt) => {
        dropZoneActive = true;

        // prevent default behavior (Prevent file from being opened)
        evt.preventDefault();
      }}
    >
      {#if loadingSubmit}
        Parsing...
      {:else}
        Drag and drop the screenshot or picture here or click upload to select the photo or scan the QR code.
        <Button on:click={() => uploadInput.click()}>Upload</Button>
      {/if}
    </div>
  </FieldWrapper>

  <input
    bind:this={uploadInput}
    type="file"
    id="qr"
    name="qr"
    accept="image/*"
    on:change={(evt) => {
      if (evt.target?.files?.[0]) processFile(evt.target.files[0]);
    }}
  />

  <canvas bind:this={canvas} />

  <svelte:fragment slot="footer">
    <Button
      on:click={async () => {
        loadingCancel = true;
        await handleAction?.();
        await handleCancel?.();
        loadingCancel = false;
        open = false;
      }}
    >
      {#if loadingCancel}
        <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
      {:else}
        Cancel
      {/if}
    </Button>
  </svelte:fragment>
</ContentDialog>

<style>
  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 20px;
    border: 2px solid var(--fds-control-stroke-default);
    height: 120px;
    box-sizing: border-box;
    padding: 20px;
    border-radius: var(--fds-control-corner-radius);
  }
  .dropzone.dropZoneActive {
    border-color: var(--fds-accent-default);
  }

  canvas,
  input {
    display: none;
  }
</style>
