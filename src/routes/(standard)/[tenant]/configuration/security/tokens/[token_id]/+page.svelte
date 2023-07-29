<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { DateTime } from '$lib/common/DateTime';
  import { FieldWrapper } from '$lib/common/Field';
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ActionRow, PageTitle } from '$lib/common/PageTitle';
  import { SelectOne, type Option } from '$lib/common/Select';
  import { motionMode } from '$stores/motionMode';
  import { isJSON, notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, Checkbox, ComboBox, InfoBar, ProgressRing, TextBox } from 'fluent-svelte';
  import { Types } from 'mongoose';
  import { expoOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import ScopesList from '../ScopesList.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ tokens } = data);
  $: thisToken = $tokens.data?.configuration?.security.tokens
    ?.filter(notEmpty)
    .find((token) => token._id === data.params.token_id);
  $: setValues(thisToken);

  let tokenName = '';
  let tokenScopes: string[] = [];

  let userOption: Option | null | undefined = undefined;
  $: userId = userOption?._id;

  let neverExpire = false;
  let expireDate = new Date();
  $: month = expireDate.getMonth() + 1;
  $: day = expireDate.getDate();
  $: year = expireDate.getFullYear();
  $: time = toIsoString(expireDate).split('T')[1];
  /** ISO date OR 'never' */
  $: expires = neverExpire ? 'never' : expireDate.toISOString();

  function setValues(token: typeof thisToken) {
    if (token?.name) tokenName = token.name;
    if (token?.user_id) userOption = { _id: token.user_id };
    if (token?.scope)
      tokenScopes = Object.entries(token.scope)
        .filter(([, value]) => !!value)
        .map(([key]) => key);
    if (token?.expires) {
      neverExpire = token.expires === 'never';
      if (token.expires !== 'never') {
        expireDate = new Date(token.expires);
      }
    }
  }

  function toIsoString(date: Date) {
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function (num: number) {
        return (num < 10 ? '0' : '') + num;
      };

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds()) +
      dif +
      pad(Math.floor(Math.abs(tzo) / 60)) +
      ':' +
      pad(Math.abs(tzo) % 60)
    );
  }

  $: if (browser) document.title = 'Edit token ' + thisToken?.name;

  let saving = false;
  let error = '';
</script>

<PageTitle>Edit token options</PageTitle>

<ActionRow>
  <Button
    variant="accent"
    disabled={!tokenName || saving || !tokenScopes || !userId || !expires || !thisToken?._id}
    style="width: 190px;"
    on:click={async () => {
      saving = true;
      if (tokenName && tokenScopes && userId && thisToken?._id) {
        await data
          .modifyToken({
            _id: thisToken._id,
            name: tokenName,
            expires: expires,
            scope: {
              admin: tokenScopes.includes('admin'),
            },
            user_id: userId,
          })
          .finally(() => {
            saving = false;
          })
          .then(async (_data) => {
            if (_data.setToken !== null) {
              throw new Error(`The response data is missing.`);
            }
            $tokens.refetch();
            goto(`/${data.authUser.tenant}/configuration/security/tokens`);
          })
          .catch((err) => {
            // graphql error
            if (isJSON(err.message) && Array.isArray(JSON.parse(err.message))) {
              error = JSON.parse(err.message)[0]?.message;
              return;
            }
            if (err.message) {
              error = err.message;
              return;
            }
            error = JSON.stringify(err);
          });
      }
    }}
  >
    {#if saving}
      <ProgressRing style="--fds-accent-default: currentColor;" size={16} />
    {:else}
      <FluentIcon name="Save16Regular" mode="buttonIconLeft" />
      Save and return to list
    {/if}
  </Button>
</ActionRow>

<section in:fly={{ y: 40, duration: $motionMode === 'reduced' ? 0 : 270, easing: expoOut }}>
  {#if error}
    <InfoBar severity="critical">
      Error creating token:
      <pre style="white-space: normal;">{error}</pre>
    </InfoBar>
  {/if}

  <div class="flex-zone">
    <div>
      <FieldWrapper
        label="Name"
        description="Give this token a name so you can keep track of where and why it is in use."
        forId="token-name"
      >
        <TextBox type="text" id="token-name" bind:value={tokenName} />
      </FieldWrapper>

      <FieldWrapper
        label="Expiration date and time"
        description="This token will {neverExpire ? 'never expire' : 'stop working after this date and time'}."
        forId="token-expires"
      >
        {#if !neverExpire}
          <DateTime bind:datetime={expireDate} bind:month bind:day bind:year bind:time />
        {/if}
        <Checkbox bind:checked={neverExpire}>Never expire this token</Checkbox>
      </FieldWrapper>

      <FieldWrapper
        label="User"
        description="Actions authenticated with this token will be attributed to this user."
        forId="token-user"
      >
        <SelectOne reference={{ collection: 'User' }} bind:selectedOption={userOption} />
      </FieldWrapper>
    </div>
    <div>
      <FieldWrapper label="Scopes" forId="token-scopes">
        <div class="scopes-checkboxes-wrapper">
          <ScopesList bind:scopes={tokenScopes} />
        </div>
      </FieldWrapper>
    </div>
  </div>
</section>

<style>
  section {
    margin: 0 auto;
    padding: 0 20px;
    max-width: 1000px;
  }

  div.flex-zone {
    display: flex;
    flex-direction: row-reverse;
    gap: 50px;
    margin-top: 20px;
  }

  div.flex-zone > div:first-of-type {
    flex: 1;
  }

  .scopes-checkboxes-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 5px 0;
  }
</style>
