/* eslint-disable react-hooks/rules-of-hooks */
import { useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import ColorHash from 'color-hash';
import { get as getProperty } from 'object-path';
import { useRef } from 'react';
import { useModal } from 'react-modal-hook';
import { useLocation } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { ReferenceMany } from '../../../components/ContentField';
import { Field } from '../../../components/ContentField/Field';
import { PlainModal } from '../../../components/Modal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setField, setUnsavedPermissionField } from '../../../redux/slices/cmsItemSlice';
import { colorType, themeType } from '../../../utils/theme/theme';
import { saveChanges } from './saveChanges';

const colorHash = new ColorHash({ saturation: 0.8, lightness: 0.5 });

function useShareModal(collection?: string, itemId?: string, color: colorType = 'primary') {
  const client = useApolloClient();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const isFs = searchParams.get('fs') === '1' || searchParams.get('fs') === 'force';

  // create the modal
  const [showModal, hideModal] = useModal(() => {
    const itemState = useAppSelector((state) => state.cmsItem);
    const dispatch = useAppDispatch();
    const theme = useTheme() as themeType;
    const linkRef = useRef<HTMLTextAreaElement>(null);

    const current: {
      users: { _id: string; name: string; photo?: string; color: string }[];
      teams: { _id: string; name?: string; color: string }[];
    } = {
      users:
        getProperty(itemState.fields, 'permissions.users')?.map(
          (user: {
            _id: string;
            name?: string;
            label?: string;
            photo?: string;
          }): { _id: string; label?: string; photo?: string; color: string } => ({
            ...user,
            label: user.name || user.label,
            color: colorHash.hex(user._id),
          })
        ) || [],
      teams:
        getProperty(itemState.fields, 'permissions.teams')
          ?.filter((_id: string | { _id: string; label: string }) => !!_id)
          .map((_id: string | { _id: string; label: string }) => {
            if (typeof _id === 'string') {
              return { _id, color: colorHash.hex(_id) };
            }
            return { _id: _id._id, label: _id.label, color: colorHash.hex(_id._id) };
          }) || [],
    };

    if (collection && itemId) {
      return (
        <PlainModal
          hideModal={hideModal}
          title={`Share`}
          isLoading={itemState.isLoading}
          cancelButton={{ color: isFs ? 'blue' : color }}
          continueButton={{
            text: 'Save changes',
            color: isFs ? 'blue' : color,
            onClick: async () => {
              return await saveChanges(
                client,
                collection,
                itemId,
                { dispatch, state: itemState, refetch: () => null },
                {},
                true
              );
            },
          }}
          styleString={`width: 370px; background-color: ${
            theme.mode === 'dark' ? theme.color.neutral.dark[100] : `#ffffff`
          }; > div:first-of-type { height: 400px; }`}
        >
          <>
            <Field
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
            </Field>

            <ReferenceMany
              label={'Users'}
              color={isFs ? 'blue' : color}
              values={current.users}
              disabled={itemState.isLoading || JSON.stringify(itemState.fields) === JSON.stringify({})}
              isEmbedded={true}
              collection={'User'}
              onChange={(newValues) => {
                if (newValues !== undefined) {
                  dispatch(
                    setUnsavedPermissionField(
                      newValues.map((v) => v._id),
                      'permissions.users'
                    )
                  );
                  dispatch(setField(newValues, 'permissions.users', 'reference', false));
                }
              }}
              noDrag
            />
            <ReferenceMany
              label={'Teams'}
              color={isFs ? 'blue' : color}
              values={current.teams}
              disabled={itemState.isLoading || JSON.stringify(itemState.fields) === JSON.stringify({})}
              isEmbedded={true}
              collection={'Team'}
              onChange={(newValues) => {
                if (newValues !== undefined) {
                  dispatch(
                    setUnsavedPermissionField(
                      newValues.map((v) => v._id),
                      'permissions.teams'
                    )
                  );
                  dispatch(setField(newValues, 'permissions.teams', 'reference', false));
                }
              }}
              noDrag
            />
          </>
        </PlainModal>
      );
    }

    return (
      <PlainModal hideModal={hideModal} title={`Share`} isLoading={itemState.isLoading}>
        <div>Improper context!</div>
      </PlainModal>
    );
  }, [isFs]);

  // return the modal
  return [showModal, hideModal];
}

export { useShareModal };
