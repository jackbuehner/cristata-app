import styled from '@emotion/styled/macro';
import { CollectionPermissionsActions } from '@jackbuehner/cristata-api/dist/types/config';
import Color from 'color';
import { useDispatch } from 'react-redux';
import { ReferenceMany } from '../../../../components/ContentField';
import { useAppSelector } from '../../../../redux/hooks';
import { setActionAccess } from '../../../../redux/slices/collectionSlice';
import { capitalize } from '../../../../utils/capitalize';

interface ActionAccessCardProps {}

function ActionAccessCard(props: ActionAccessCardProps) {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useDispatch();

  const canPublish = state.collection?.canPublish;
  const actionAccess = state.collection?.actionAccess;

  return (
    <Card>
      <CardLabel>Action access</CardLabel>
      <CardLabelCaption>
        Control the actions that can be done by different users and teams (user groups).
      </CardLabelCaption>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {(
          [
            'get',
            'create',
            'modify',
            'hide',
            'lock',
            'watch',
            'archive',
            'delete',
            canPublish ? 'publish' : null,
            'bypassDocPermissions',
          ] as unknown as CollectionPermissionsActions[]
        )
          .filter((a) => !!a)
          .map((action) => {
            return (
              <Card key={'action'} noMargin>
                <CardLabel>{capitalize(action)}</CardLabel>
                <CardLabelCaption>
                  {action === 'get' ? (
                    <>
                      Users and teams without <code>Get</code> access will not be able to see any documents in
                      the collection.
                    </>
                  ) : action === 'create' ? (
                    <>
                      Users and teams without <code>Create</code> access will not be able to create new
                      documents in the collection. This does not restrict access to viewing and modifying
                      documents.
                    </>
                  ) : action === 'modify' ? (
                    <>
                      Users and teams without <code>Modify</code> access will not be able to modify existing
                      documents in the collection. This does not restrict access to viewing and creating
                      documents.
                    </>
                  ) : action === 'hide' ? (
                    <>
                      Users and teams without <code>Hide</code> access will not be able to hide documents in the
                      collection. In Cristata, the hide action is presented as deleting a document. documents.
                    </>
                  ) : action === 'lock' ? (
                    <>Unused</>
                  ) : action === 'watch' ? (
                    <>
                      Users and teams without <code>Watch</code> access will be unable to receive email notices
                      when the stage of a document changes. The <b>Watch</b> button will be disabled for them in
                      Cristata.
                    </>
                  ) : action === 'archive' ? (
                    <>
                      Users and teams without <code>Archive</code> access will be unable to archive and
                      unarchive documents in this collection. They will still be able to view archived
                      documents.
                    </>
                  ) : action === 'delete' ? (
                    <>
                      Users and teams without <code>Delete</code> access will be unable to <i>permanently</i>{' '}
                      delete documents in this collection. This power is only available via the API.
                    </>
                  ) : action === 'publish' ? (
                    <>
                      Users and teams without <code>Publish</code> access will be unable to use the Publish
                      popup in Cristata. They may still be able to publish items by modifying fields via the API
                      based on how your published document settings and workflow is configured.
                    </>
                  ) : action === 'bypassDocPermissions' ? (
                    <>
                      Documents with individual permissions for access (via the <b>Share</b> modal) may allow
                      users to hide their documents from other users. Users and teams with the{' '}
                      <code>BypassDocPermissions</code> action will be able to see and edit these documents
                      despite their individual permissions. This option does not give <code>Get</code> and{' '}
                      <code>Modify</code> permissions to users and teams; you still need to provide those
                      permissions.
                    </>
                  ) : (
                    <></>
                  )}
                </CardLabelCaption>
                <ReferenceMany
                  isEmbedded
                  label={`Users`}
                  values={
                    actionAccess?.[action]?.users.map((user) =>
                      user === 0 ? { _id: 'any', label: 'Any user' } : { _id: user }
                    ) || []
                  }
                  injectOptions={[{ value: 'any', label: 'Any user' }]}
                  collection={'User'}
                  onChange={(newValues) => {
                    const current = actionAccess?.[action];
                    if (newValues !== undefined && current) {
                      dispatch(
                        setActionAccess(action, {
                          users: newValues.map((value) => (value._id === 'any' ? 0 : value._id)),
                          teams: current.teams,
                        })
                      );
                    }
                  }}
                />
                <ReferenceMany
                  isEmbedded
                  label={`Teams`}
                  values={
                    actionAccess?.[action]?.teams.map((team) =>
                      team === 0 ? { _id: 'any', label: 'Any team' } : { _id: team }
                    ) || []
                  }
                  injectOptions={[{ value: 'any', label: 'Any team' }]}
                  collection={'Team'}
                  onChange={(newValues) => {
                    const current = actionAccess?.[action];
                    if (newValues !== undefined && current) {
                      dispatch(
                        setActionAccess(action, {
                          users: current.users,
                          teams: newValues.map((value) => (value._id === 'any' ? 0 : value._id)),
                        })
                      );
                    }
                  }}
                />
              </Card>
            );
          })}
      </div>
    </Card>
  );
}

const Card = styled.div<{ noMargin?: boolean }>`
  margin: ${({ noMargin }) => (noMargin ? 0 : 16)}px 0;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
`;

const CardLabel = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0 0 16px 0;
`;

const CardLabelCaption = styled.div`
  line-height: 15px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1100]};
  margin: -12px 0 16px 0;
  user-select: none;
`;

export { ActionAccessCard };
