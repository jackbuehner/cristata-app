import { useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import ColorHash from 'color-hash';
import { DateTime } from 'luxon';
import { MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { collections } from '../../config';
import { collection as collectionType } from '../../config/collections';
import { HISTORY, HISTORY__DOC_TYPE, HISTORY__TYPE } from '../../graphql/queries';
import { genAvatar } from '../../utils/genAvatar';
import { themeType } from '../../utils/theme/theme';

/**
 * Displays the recent actiivty in the CMS.
 *
 * The recent activity is retireved from the `/history` endpoint.
 */
function RecentActivity() {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();

  const { data } = useQuery<HISTORY__TYPE>(HISTORY, {
    variables: { limit: 25, exclude: ['User'] },
    fetchPolicy: 'no-cache',
  });
  const unmergedHistory = data?.collectionActivity.docs;
  const activity = (() => {
    type mergedHistoryType = {
      _id: HISTORY__DOC_TYPE['_id'];
      name: HISTORY__DOC_TYPE['name'];
      in: HISTORY__DOC_TYPE['in'];
      users: Array<HISTORY__DOC_TYPE['user']>;
      action: HISTORY__DOC_TYPE['action'];
      at: HISTORY__DOC_TYPE['at'];
    };

    let merged: mergedHistoryType[] = [];

    if (unmergedHistory) {
      for (let i = 0; i < unmergedHistory.length; i++) {
        const prevElement = i > 0 ? unmergedHistory[i - 1] : undefined;
        const element = unmergedHistory[i];

        // user must be defined
        if (element.user) {
          // if this history item's _id matches the previous item's _id,
          // AND they have the same action (e.g. patched vs published),
          // we need to merge them in the merged history array
          if (element._id === prevElement?._id && element.action === prevElement.action) {
            const mergedIndex = merged.findIndex((item) => item._id === element._id);
            const userAlreadyInUsers = !!merged[mergedIndex].users
              .filter((user) => !!user)
              .find((user) => user._id === element.user._id);
            merged[mergedIndex] = {
              // use the existing matchign data (_id, name, in, etc.)
              ...merged[mergedIndex],
              // merge user from the current history item (in the loop) into the users array
              users: userAlreadyInUsers
                ? merged[mergedIndex].users
                : [...merged[mergedIndex].users, element.user],
              // use the most recent ISO date string
              at: new Date(element.at) > new Date(merged[mergedIndex].at) ? element.at : merged[mergedIndex].at,
            };
          }

          // otherwise, add the element to the mergd history array
          else {
            const { user } = element; // destructure so that user is not pushed
            merged.push({ ...element, users: [user] });
          }
        }
      }
    }

    return merged;
  })();

  // determine the largest amount of users in a single merged activity
  const mostUsers =
    activity.length > 0
      ? activity.reduce((max, obj) => (obj.users.length > max.users.length ? obj : max)).users.length
      : undefined;

  // determine collection locations (to be used for links to cms items)
  const collectionLocations: Record<string, collectionType<any>['row']> = {};
  Object.entries(collections).forEach(([key, value]) => {
    const colNameL = value!.query.name.plural.toLowerCase();
    if (value?.row) collectionLocations[colNameL] = value.row;
    else {
      collectionLocations[colNameL] = {
        href: value!.query.name.plural,
        hrefSuffixKey: '_id',
      };
    }
  });

  return (
    <>
      {
        // generate lines for each activity item
        activity?.slice(0, 6).map((item, index: number) => {
          let type = item.action;
          const at = item.at;
          const users = item.users;

          // rename history types
          type =
            type === 'patched'
              ? 'modified'
              : type === 'created'
              ? 'created'
              : type === 'hidden'
              ? 'removed'
              : 'modified';

          // construct the link to the collection item page
          let locHref = '';
          const colLoc = collectionLocations[item.in];
          if (colLoc) {
            const { href, hrefSuffixKey, hrefSearch } = colLoc;
            if (item.in === 'photos') locHref = `/cms/photos/library/${item._id}`;
            else if (hrefSuffixKey === '_id') locHref = `${href}/${item._id}${hrefSearch || ''}`;
            else locHref = `${href.replace('item', 'collection')}`;
          } else if (item.in === 'teams') locHref = `/teams/${item._id}`;

          return (
            <ItemWrapper theme={theme} key={index}>
              <Item>
                <ListNames
                  NameComponent={Bold}
                  PhotoComponent={ProfilePhoto}
                  TextWrapperComponent={Text}
                  names={users.map((user) => ({
                    name: user.name,
                    onClick: () => navigate(`/profile/${user._id}`),
                    photo: user.photo || genAvatar(user._id),
                  }))}
                  appendText={
                    <>
                      <span> {type} </span>
                      <Bold theme={theme} onClick={() => navigate(locHref)}>
                        {item.name}
                      </Bold>
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
              <DateComponent theme={theme}>{DateTime.fromISO(at).toRelative()}</DateComponent>
            </ItemWrapper>
          );
        })
      }
    </>
  );
}

interface IListNames {
  NameComponent: React.ComponentType<{ onClick?: MouseEventHandler<HTMLElement>; theme: themeType }>;
  PhotoComponent: React.ComponentType<{
    onClick?: MouseEventHandler<HTMLElement>;
    theme: themeType;
    src?: string;
  }>;
  TextWrapperComponent: React.ComponentType;
  names: Array<{
    name: string;
    onClick?: MouseEventHandler<HTMLElement>;
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
  const theme = useTheme() as themeType;
  const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

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
          {props.names.slice(0, props.photos.maxPhotos || 3).map(({ photo, onClick }) => {
            return <props.PhotoComponent src={photo} theme={theme} onClick={onClick} />;
          })}
        </PhotosWrapper>
      ) : null}
      <props.TextWrapperComponent>
        {props.names.length === 1 ? (
          <props.NameComponent theme={theme} onClick={props.names[0].onClick}>
            <span>{props.names[0].name}</span>
          </props.NameComponent>
        ) : props.names.length === 2 ? (
          <>
            <props.NameComponent theme={theme} onClick={props.names[0].onClick}>
              <span>{props.names[0].name}</span>
            </props.NameComponent>
            <span> and </span>
            <props.NameComponent theme={theme} onClick={props.names[1].onClick}>
              <span>{props.names[1].name}</span>
            </props.NameComponent>
          </>
        ) : props.names.length >= 3 ? (
          <>
            {props.names.slice(0, props.names.length - 1).map((name, index: number) => {
              return (
                <>
                  <props.NameComponent theme={theme} onClick={name.onClick}>
                    <span key={index}>{name.name}</span>
                  </props.NameComponent>
                  <span>, </span>
                </>
              );
            })}
            <span>and </span>
            <props.NameComponent theme={theme} onClick={props.names.slice(-1)[0].onClick}>
              <span>{props.names.slice(-1)[0].name}</span>
            </props.NameComponent>
          </>
        ) : null}
        {props.appendText}
      </props.TextWrapperComponent>
    </>
  );
}

const ItemWrapper = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 8px 0;
  &:first-of-type {
    margin-top: 12px;
    @media (max-width: 1200px) {
      margin-top: 6px;
    }
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

const DateComponent = styled.div<{ theme: themeType }>`
  flex-shrink: 0;
  font-size: 11px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][900]};
`;

const Bold = styled.a<{ theme: themeType }>`
  font-weight: 700;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ProfilePhoto = styled.div<{ theme: themeType; src?: string }>`
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
