<script lang="ts">
  import type { ActivitiesListQuery } from '$graphql/graphql';
  import Loading from '$lib/common/Loading.svelte';
  import { compactMode } from '$stores/compactMode';
  import { server } from '$utils/constants';
  import { camelToDashCase, notEmpty } from '@jackbuehner/cristata-utils';
  import { Button, PersonPicture } from 'fluent-svelte';
  import { DateTime } from 'luxon';
  import pluralize from 'pluralize';
  import type { LayoutDataType } from '../../routes/(standard)/[tenant]/+layout';

  export let activities: NonNullable<NonNullable<NonNullable<ActivitiesListQuery['activities']>['docs']>[0]>[];
  export let tenant: string;
  export let configuration: LayoutDataType['configuration'];
  export let loading: boolean = false;

  $: mergedActivities = (() => {
    type mergedHistoryType = {
      _id: (typeof activities)[0]['_id'];
      docId: (typeof activities)[0]['docId'];
      docName: (typeof activities)[0]['docName'];
      colName: (typeof activities)[0]['colName'];
      users: NonNullable<(typeof activities)[0]['userIds'][0]>[];
      actions: Array<(typeof activities)[0]['type']>;
      at: (typeof activities)[0]['at'];
    };

    let merged: mergedHistoryType[] = [];

    if (activities) {
      activities.forEach((unmergedElement, i) => {
        // try to find the closest history item with the same docId
        // (this assumes that newsest items are added first)
        let closestMatch: mergedHistoryType | undefined = undefined;
        let closestMatchIndex: number = -1;
        for (let j = merged.length - 1; j >= 0; j--) {
          const mergedElement = merged[j];
          if (mergedElement.docId === unmergedElement.docId) {
            closestMatch = mergedElement;
            closestMatchIndex = j;
            break;
          }
        }

        // if no match was found, add it to the merged history array
        if (!closestMatch) {
          merged.push({
            _id: unmergedElement._id,
            docId: unmergedElement.docId,
            docName: unmergedElement.docName,
            colName: unmergedElement.colName,
            users: unmergedElement.userIds.filter(notEmpty),
            actions: [unmergedElement.type],
            at: unmergedElement.at,
          });
          return;
        }

        // if closest match exists and the actions are compatable, merge them
        if (
          actionsContainsSame(closestMatch.actions, unmergedElement.type) ||
          actionsContainsOpposite(closestMatch.actions, unmergedElement.type)
        ) {
          merged[closestMatchIndex] = {
            // use the existing matching data (_id, name, in, etc.)
            ...closestMatch,
            // use the most recent ISO date string
            at:
              new Date(unmergedElement.at) > new Date(merged[closestMatchIndex].at)
                ? unmergedElement.at
                : merged[closestMatchIndex].at,
            // merge actions with duplicates retained
            actions: Array.from(new Set([...closestMatch.actions, unmergedElement.type])),
            // merge user from the current history item (in the loop) into the users array
            users: (() => {
              const map = new Map<string, string>();
              closestMatch.users.forEach((user) => {
                map.set(user._id, user.name);
              });
              unmergedElement.userIds.filter(notEmpty).forEach((user) => {
                map.set(user._id, user.name);
              });
              return Array.from(map.entries()).map(([key, value]) => {
                return {
                  _id: key,
                  name: value,
                };
              });
            })(),
          };
          return;
        }

        // if no compatable actions were found, add it to the merged history array
        merged.push({
          _id: unmergedElement._id,
          docId: unmergedElement.docId,
          docName: unmergedElement.docName,
          colName: unmergedElement.colName,
          users: unmergedElement.userIds.filter(notEmpty),
          actions: [unmergedElement.type],
          at: unmergedElement.at,
        });
        return;
      });
    }

    /**
     * Whether the actions array contains an opposite.
     *
     * An example opposite is archive and unarchive.
     */
    function actionsContainsOpposite(
      mActions: mergedHistoryType['actions'],
      nAction: mergedHistoryType['actions'][0]
    ): boolean {
      return mActions.some(
        (mAction) => mAction.replace('un', '') === nAction.replace('un', '') && mAction !== nAction
      );
    }

    /**
     * Whether the actions array contains a match.
     *
     * An example opposite is archive and unarchive.
     */
    function actionsContainsSame(
      mActions: mergedHistoryType['actions'],
      nAction: mergedHistoryType['actions'][0]
    ): boolean {
      return mActions.some((mAction) => mAction === nAction);
    }

    // prefer the newest instance of an action where
    // _id, in, and actions are the same and dates are recent (within 6 hours)
    const filteredMerged: typeof merged = [];
    merged.forEach((item) => {
      const i = filteredMerged.findIndex((x) => {
        return (
          x._id === item._id &&
          x.colName === item.colName &&
          x.actions.every((action) => item.actions.includes(action)) &&
          // 6 hours
          new Date(x.at) < new Date(new Date(item.at).valueOf() + 1000 * 60 * 60 * 6) &&
          x.users.every((user) => item.users.map((u) => u._id).includes(user._id))
        );
      });
      if (i <= -1) {
        filteredMerged.push(item);
      } else {
        const dedupedUsers = Array.from(
          new Set([
            ...filteredMerged[i].users.map((user) => JSON.stringify(user)),
            ...item.users.map((user) => JSON.stringify(user)),
          ])
        ).map((user) => JSON.parse(user));

        // merge users so no users are left out
        filteredMerged[i].users = dedupedUsers;
      }
    });

    return filteredMerged;
  })();

  // determine the largest amount of users in a single merged activity
  $: mostUsers =
    mergedActivities.length > 0
      ? mergedActivities.reduce((max, obj) => (obj.users.length > max.users.length ? obj : max)).users.length
      : 1;
</script>

{#if loading}
  <Loading />
{:else}
  <div class="activities" class:compact={$compactMode}>
    {#each mergedActivities.sort((a, b) => (new Date(a.at) > new Date(b.at) ? -1 : 1)).slice(0, 10) as doc}
      {@const pathCollectionName = pluralize.plural(camelToDashCase(doc.colName).replaceAll('-', ''))}
      {@const collection = configuration?.collections?.filter(notEmpty).find((col) => col.name === doc.colName)}
      {@const collectionHidden = collection?.pluralLabel === '__hidden'}
      {@const users =
        doc.users.length === 0 ? [{ _id: '000000000000000000000000', name: 'Unknown' }] : doc.users}
      {@const collectionHref = (() => {
        if (doc.colName === 'Team') return `/${tenant}/teams`;
        if (doc.colName === 'User') return `/${tenant}/profile`;
        return `/${tenant}/cms/collection/${pathCollectionName}`;
      })()}

      {@const shouldOpenMaximized = !!configuration?.collections
        ?.filter(notEmpty)
        .find((col) => col.name === doc.colName)?.hasRichTextBody}
      {@const itemQueryString = shouldOpenMaximized ? '?fs=1&props=1' : ''}

      <div class="activity-row">
        <div class="activity">
          <div class="person-picture-list" style="width: {24 + (mostUsers - 1) * 11}px; margin-right: 5px">
            {#each users.slice(0, 3) as user, index}
              <PersonPicture
                size={24}
                src="{server.location}/v3/{tenant}/user-photo/{user._id}"
                alt={user.name}
                style="--left: {index * -16}px;"
              />
            {/each}
          </div>

          <div>
            <div class="people-list">
              {#each users as user, index}
                <span
                  style="
                display: flex;
                align-items: center;
                flex-direction: row;
              "
                >
                  <Button
                    variant="hyperlink"
                    style="padding: 0; white-space: nowrap;"
                    href="/{tenant}/profile/{user._id}"
                  >
                    {user.name}
                  </Button>

                  <span class="activity-text" style="white-space: pre;">
                    {#if users.length === 2}
                      {#if index === 0}
                        {' and'}
                      {/if}
                    {:else if users.length >= 3}
                      {#if index === users.length - 2}
                        , and
                      {:else if index !== users.length - 1}
                        ,
                      {/if}
                    {/if}
                  </span>
                </span>
              {/each}
            </div>

            <span class="activity-text">
              {#each doc.actions as type}
                {#if type === 'created'}
                  created
                {:else if type === 'ydoc-modified' || type === 'modified' || type === 'patched'}
                  modified
                {:else if type === 'published'}
                  published
                {:else if type === 'unpublished'}
                  unpublished
                {:else if type === 'archive'}
                  archived
                {:else if type === 'unarchive'}
                  unarchived
                {:else if type === 'hidden'}
                  deleted
                {:else if type === 'unhidden'}
                  restored
                {:else if type === 'delete'}
                  permanently deleted
                {:else}
                  {type}
                {/if}
              {/each}
            </span>

            {#if collectionHidden}
              <span class="activity-text">{doc.docName || 'a document'}</span>
            {:else}
              <Button
                variant="hyperlink"
                style="padding: 0;"
                href="{collectionHref}/{doc.docId}{itemQueryString}"
              >
                {doc.docName || 'a document'}
              </Button>
            {/if}

            <span class="activity-text">in</span>

            {#if collectionHidden}
              <span class="activity-text">{pathCollectionName}</span>
            {:else}
              <Button variant="hyperlink" style="padding: 0;" href={collectionHref}>
                {pathCollectionName}
              </Button>
            {/if}
          </div>
        </div>
        <span class="time">{DateTime.fromISO(doc.at).toRelative()}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .activities {
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: var(--color-neutral-light-1400);
  }
  .activities.compact {
    gap: 8px;
  }
  @media (prefers-color-scheme: dark) {
    .activities {
      color: var(--color-neutral-dark-1400);
    }
  }

  .activities :global(*) {
    font-size: 12px !important;
  }

  .activity-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .activity {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 3px;
  }

  .person-picture-list {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 3px;
    position: relative;
  }

  .person-picture-list :global(.person-picture-container) {
    flex-shrink: 0;
  }

  .person-picture-list :global(.person-picture) {
    position: absolute;
    left: var(--left);
  }

  .people-list {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 3px;
    flex-wrap: wrap;
  }

  .activity :global(.button.style-hyperlink) {
    font-weight: 600;
    color: inherit;
  }

  .time {
    color: var(--color-neutral-light-900);
  }
  @media (prefers-color-scheme: dark) {
    .time {
      color: var(--color-neutral-dark-900);
    }
  }
</style>
