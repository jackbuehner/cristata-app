/* eslint-disable react-hooks/rules-of-hooks */
import { useTheme } from '@emotion/react';
import ColorHash from 'color-hash';
import { get as getProperty } from 'object-path';
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { CollaborativeFieldWrapper, CollaborativeReferenceMany } from '../../../components/CollaborativeFields';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { useWindowModal } from '../../../hooks/useWindowModal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { server } from '../../../utils/constants';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType, themeType } from '../../../utils/theme/theme';
import { saveChanges } from './saveChanges';

const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

function useShareModal(
  y: EntryY,
  collection?: string,
  itemId?: string,
  color: colorType = 'primary'
): [React.ReactNode, () => void, () => void] {
  const authUserState = useAppSelector((state) => state.authUser);
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const isFs = searchParams.get('fs') === '1' || searchParams.get('fs') === 'force';

  // get the session id from sessionstorage
  const sessionId = sessionStorage.getItem('sessionId');

  // get the current tenant name
  const tenant = localStorage.getItem('tenant');

  // create a user object for the current user (for yjs)
  const user = {
    name: authUserState.name,
    color: colorHash.hex(authUserState._id),
    sessionId: sessionId || '',
    photo: `${server.location}/v3/${tenant}/user-photo/${authUserState._id}` || genAvatar(authUserState._id),
  };

  // create the modal
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const itemState = useAppSelector((state) => state.cmsItem);
    const dispatch = useAppDispatch();
    const theme = useTheme() as themeType;
    const linkRef = useRef<HTMLTextAreaElement>(null);

    const current: {
      users: { _id: string; name: string; photo?: string; color: string }[];
      teams: { _id: string; name?: string; color: string }[];
    } = {
      users: getProperty(y.data, 'permissions.users') || [],
      teams: getProperty(y.data, 'permissions.teams') || [],
    };

    if (collection && itemId) {
      return {
        title: `Share`,
        isLoading: itemState.isLoading,
        cancelButton: { color: isFs ? 'blue' : color },
        continueButton: {
          text: 'Save changes',
          color: isFs ? 'blue' : color,
          onClick: async () => {
            return await saveChanges(y, (isLoading: boolean) => dispatch(setIsLoading(isLoading)), {}, true);
          },
        },
        styleString: `width: 370px; background-color: ${
          theme.mode === 'dark' ? theme.color.neutral.dark[100] : `#ffffff`
        }; > div:first-of-type { height: 400px; }`,
        windowOptions: { name: 'share doc', width: 370, height: 560 },
        children: (
          <>
            <CollaborativeFieldWrapper
              y={{ ...y, field: 'permissions.__shareButtonWrapper', user }}
              label={'Link to document'}
              description={`This link will only work for people with permission to access this document.`}
              isEmbedded={true}
            >
              <>
                <textarea
                  ref={linkRef}
                  style={{ height: 0, width: 0, margin: 0, position: 'absolute', top: 0, left: 0, opacity: 0 }}
                >
                  {window.location.href}
                </textarea>
                <Button
                  color={isFs ? 'blue' : color}
                  onClick={() => {
                    linkRef.current?.select();
                    document.execCommand('copy');
                  }}
                >
                  Copy link to document
                </Button>
              </>
            </CollaborativeFieldWrapper>

            {current.users ? (
              <CollaborativeReferenceMany
                y={{ ...y, field: 'permissions.users', user }}
                label={'Users'}
                color={isFs ? 'blue' : color}
                disabled={itemState.isLoading || JSON.stringify(y.data) === JSON.stringify({})}
                isEmbedded={true}
                collection={'User'}
                noDrag
              />
            ) : null}

            {current.teams ? (
              <CollaborativeReferenceMany
                y={{ ...y, field: 'permissions.teams', user }}
                label={'Teams'}
                color={isFs ? 'blue' : color}
                disabled={itemState.isLoading || JSON.stringify(y.data) === JSON.stringify({})}
                isEmbedded={true}
                collection={'Team'}
                noDrag
              />
            ) : null}
          </>
        ),
      };
    }

    return {
      title: `Share`,
      isLoading: itemState.isLoading,
      styleString: `width: 370px; background-color: ${
        theme.mode === 'dark' ? theme.color.neutral.dark[100] : `#ffffff`
      }; > div:first-of-type { height: 400px; }`,
      windowOptions: { name: 'share doc', width: 370, height: 560 },
      children: <div>Improper context!</div>,
    };
  }, [isFs]);

  // return the modal
  return [Window, showModal, hideModal];
}

export { useShareModal };
