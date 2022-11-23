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

export { ActionAccessCard };
