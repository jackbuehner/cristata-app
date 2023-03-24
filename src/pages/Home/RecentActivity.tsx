import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import ColorHash from 'color-hash';
import { DateTime } from 'luxon';
import pluralize from 'pluralize';
import type { MouseEventHandler } from 'react';
import React, { Fragment } from 'react';
import { useNavigate } from 'svelte-preprocess-react/react-router';
import type { HISTORY__DOC_TYPE, HISTORY__TYPE } from '../../graphql/queries';
import { HISTORY } from '../../graphql/queries';
import { camelToDashCase } from '../../utils/camelToDashCase';
import { capitalize } from '../../utils/capitalize';
import { genAvatar } from '../../utils/genAvatar';
import { listOxford } from '../../utils/listOxford';
import type { themeType } from '../../utils/theme/theme';
import { uncapitalize } from '../../utils/uncapitalize';

import * as apolloRaw from '@apollo/client';
const { useQuery } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

/**
 * Displays the recent actiivty in the CMS.
 *
 * The recent activity is retireved from the `/history` endpoint.
 */
function RecentActivity() {
  const theme = useTheme();

  const tenant = location.pathname.split('/')[1];

  const { data } = useQuery<HISTORY__TYPE>(HISTORY, {
    variables: { limit: 25, exclude: ['User'] },
    fetchPolicy: 'cache-and-network',
  });
  const unmergedHistory = data?.collectionActivity.docs;

  const activity = (() => {
    type mergedHistoryType = {
      _id: HISTORY__DOC_TYPE['_id'];
      name: HISTORY__DOC_TYPE['name'];
      in: HISTORY__DOC_TYPE['in'];
      users: Array<HISTORY__DOC_TYPE['user']>;
      actions: Array<HISTORY__DOC_TYPE['action']>;
      at: HISTORY__DOC_TYPE['at'];
    };

    let merged: mergedHistoryType[] = [];

    if (unmergedHistory) {
      unmergedHistory.forEach((unmergedElement, i) => {
        // user must be defined
        if (!unmergedElement.user) return;

        // try to find the closest history item with the same _id
        // (this assumes that newsest items are added first)
        let closestMatch: mergedHistoryType | undefined = undefined;
        let closestMatchIndex: number = -1;
        for (let j = merged.length - 1; j >= 0; j--) {
          const mergedElement = merged[j];
          if (mergedElement._id === unmergedElement._id) {
            closestMatch = mergedElement;
            closestMatchIndex = j;
            break;
          }
        }

        // if no match was found, add it to the merged history array
        if (!closestMatch) {
          const { user, action, ...rest } = unmergedElement; // destructure so that user and action are not pushed
          merged.push({ ...rest, actions: [action], users: [user] });
          return;
        }

        // if closest match exists and the actions are compatable, merge them
        if (
          actionsContainsSame(closestMatch.actions, unmergedElement.action) ||
          actionsContainsOpposite(closestMatch.actions, unmergedElement.action)
        ) {
          // whether user needs to be added to users array
          const userAlreadyInUsers = !!closestMatch.users
            .filter((user) => !!user)
            .find((user) => user._id === unmergedElement.user._id);

          merged[closestMatchIndex] = {
            // use the existing matching data (_id, name, in, etc.)
            ...closestMatch,
            // use the most recent ISO date string
            at:
              new Date(unmergedElement.at) > new Date(merged[closestMatchIndex].at)
                ? unmergedElement.at
                : merged[closestMatchIndex].at,
            // merge actions with duplicates retained
            actions: Array.from(new Set([...closestMatch.actions, unmergedElement.action])),
            // merge user from the current history item (in the loop) into the users array
            users: userAlreadyInUsers ? closestMatch.users : [...closestMatch.users, unmergedElement.user],
          };
          return;
        }

        // if no compatable actions were found, add it to the merged history array
        const { user, action, ...rest } = unmergedElement; // destructure so that user and action are not pushed
        merged.push({ ...rest, actions: [action], users: [user] });
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
          x.in === item.in &&
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
  const mostUsers =
    activity.length > 0
      ? activity.reduce((max, obj) => (obj.users.length > max.users.length ? obj : max)).users.length
      : undefined;

  return (
    <>
      {
        // generate lines for each activity item
        activity?.slice(0, 6).map((item, index) => {
          let types = item.actions;
          const at = item.at;
          const users = item.users;

          // rename history types
          types = types.map((type) => {
            return type === 'patched'
              ? 'modified'
              : type === 'created'
              ? 'created'
              : type === 'hidden'
              ? 'removed'
              : type === 'published'
              ? 'published'
              : type === 'archive'
              ? 'archived'
              : type === 'unarchive'
              ? 'unarchived'
              : 'modified';
          });

          return (
            <ItemWrapper key={index}>
              <Item>
                <ListNames
                  NameComponent={Bold}
                  PhotoComponent={ProfilePhoto}
                  TextWrapperComponent={Text}
                  names={users.map((user) => ({
                    name: user.name,
                    href: `/${tenant}/profile/${user._id}`,
                    photo: user.photo || genAvatar(user._id),
                  }))}
                  appendText={
                    <>
                      <span> {listOxford(types.reverse())} </span>
                      <ItemName
                        collectionName={capitalize(pluralize.singular(item.in))}
                        itemName={item.name}
                        itemId={item._id}
                      />
                      <span> in </span>
                      <span>{item.in}</span>
                    </>
                  }
                  photos={{
                    areShown: true,
                    maxPhotos: mostUsers && mostUsers > 3 ? 3 : mostUsers,
                    photoWidth: 24,
                  }}
                />
              </Item>
              <DateComponent>{DateTime.fromISO(at).toRelative()}</DateComponent>
            </ItemWrapper>
          );
        })
      }
    </>
  );
}

function ItemName({
  collectionName,
  itemName,
  itemId,
}: {
  collectionName: string;
  itemName: string;
  itemId?: string;
}) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const tenant = window.location.pathname.split('/')[1];

  const pathCollectionName = camelToDashCase(uncapitalize(pluralize(collectionName)));

  const href = (() => {
    if (collectionName === 'Team' && itemId) return `/${tenant}/teams/${itemId}`;
    if (collectionName === 'User' && itemId) return `/${tenant}/profile/${itemId}`;
    else if (itemId) return `/${tenant}/cms/collection/${pathCollectionName}/${itemId}`;
    else return `/${tenant}/cms/collection/${pathCollectionName}`;
  })();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <Bold onClick={handleClick} href={href}>
      {itemName}
    </Bold>
  );
}

interface IListNames {
  NameComponent: React.ComponentType<{ href?: string }>;
  PhotoComponent: React.ComponentType<{
    onClick?: React.MouseEventHandler;
    src?: string;
  }>;
  TextWrapperComponent: React.ComponentType;
  names: Array<{
    name: string;
    href?: string;
    photo?: string;
  }>;
  appendText?: React.ReactNode;
  photos?: {
    areShown?: boolean; // default true
    maxPhotos?: number; // default 3
    photoWidth: number;
  };
}

function ListNames(props: IListNames) {
  const navigate = useNavigate();

  // @ts-expect-error 'bkdr' is a vlid hash config value
  const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5, hash: 'bkdr' });

  // shows a list of photos that overlap each other
  // automatically sets z-index to ensure first photo is on top and last photo is on bottom
  const PhotosWrapper = styled.div<{ maxPhotos?: number; photoWidth: number; ids: string[] }>`
    display: grid;
    grid-template-columns: ${({ maxPhotos, photoWidth }) =>
      Array.from(Array((maxPhotos || 3) - 1))
        .map(() => `16px`)
        .join(` `) + ` ${photoWidth}px`};
    ${({ maxPhotos, ids }) =>
      Array.from(Array(maxPhotos || 3))
        .map(
          (_, index, arr) => `
    > *:nth-of-type(${index + 1}) {
      z-index: ${arr.length - index};
      box-shadow: inset 0 0 0 1.5px ${colorHash.hex(
        ids[index] || Math.random().toString()
      )}, 0 0 2px 0.5px #00000040;
    }
    `
        )
        .join('\n')};
  `;

  return (
    <>
      {props.photos ? (
        <PhotosWrapper
          maxPhotos={props.photos.maxPhotos}
          photoWidth={props.photos.photoWidth}
          ids={props.names.map((n) => n.name)}
        >
          {props.names.slice(0, props.photos.maxPhotos || 3).map(({ photo, href }, index) => {
            return <props.PhotoComponent src={photo} onClick={() => navigate(href || '?')} key={index} />;
          })}
        </PhotosWrapper>
      ) : null}
      <props.TextWrapperComponent>
        {props.names.length === 1 ? (
          <props.NameComponent href={props.names[0].href}>
            <span>{props.names[0].name}</span>
          </props.NameComponent>
        ) : props.names.length === 2 ? (
          <>
            <props.NameComponent href={props.names[0].href}>
              <span>{props.names[0].name}</span>
            </props.NameComponent>
            <span> and </span>
            <props.NameComponent href={props.names[1].href}>
              <span>{props.names[1].name}</span>
            </props.NameComponent>
          </>
        ) : props.names.length >= 3 ? (
          <>
            {props.names.slice(0, props.names.length - 1).map((name, index: number) => {
              return (
                <Fragment key={index}>
                  <props.NameComponent href={name.href}>
                    <span key={index}>{name.name}</span>
                  </props.NameComponent>
                  <span>, </span>
                </Fragment>
              );
            })}
            <span>and </span>
            <props.NameComponent href={props.names.slice(-1)[0].href}>
              <span>{props.names.slice(-1)[0].name}</span>
            </props.NameComponent>
          </>
        ) : null}
        {props.appendText}
      </props.TextWrapperComponent>
    </>
  );
}

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 8px 0;
  &:first-of-type {
    margin-top: -8px;
  }
  &:last-of-type {
    margin-bottom: -8px;
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Text = styled.div`
  margin: 0 8px;
`;

const DateComponent = styled.div`
  flex-shrink: 0;
  font-size: 11px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][900]};
`;

const Bold = styled.a`
  font-weight: 700;
  text-decoration: none;
  color: currentColor;
  &:hover {
    text-decoration: underline;
  }
`;

const ProfilePhoto = styled.div<{ src?: string }>`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ src }) => `url(${src})`};
  background-position: center;
  background-size: cover;
  box-shadow: inset 0 0 0 1.5px black;
`;

export { RecentActivity };
