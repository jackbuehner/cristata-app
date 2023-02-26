import { useApolloClient } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { Text } from '../../../components/ContentField';
import { Offline } from '../../../components/Offline';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import type { themeType } from '../../../utils/theme/theme';
import { useGetTokensAndSecrets } from './useGetTokensAndSecrets';

function TokenSecretsPage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const [data, loading, error, refetch] = useGetTokensAndSecrets();
  const client = useApolloClient();

  // set document title
  useEffect(() => {
    document.title = `Secrets`;
  }, []);

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(loading));
  }, [dispatch, loading]);

  // store secrets in state
  const [fathomSiteId, setFathomSiteId] = useState('');
  const [fathomDashboardPassword, setFathomDashboardPassword] = useState('');
  const [areSecretsShown, setAreSecretsShown] = useState(false);
  useEffect(() => {
    if (data) {
      setFathomSiteId(data.secrets.fathom?.siteId || '');
      setFathomDashboardPassword(data.secrets.fathom?.dashboardPassword || '');
    }
  }, [data]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('Secrets'));
    dispatch(
      setAppActions([
        {
          label: 'Refresh data',
          type: 'icon',
          icon: 'ArrowClockwise24Regular',
          action: () => refetch(),
        },
        {
          label: 'Save',
          type: 'button',
          icon: 'Save24Regular',
          action: () => {
            dispatch(setAppLoading(true));
            client
              .mutate<SaveMutationType>({
                mutation: saveMutationString([
                  { key: 'fathom.siteId', value: fathomSiteId },
                  { key: 'fathom.dashboardPassword', value: fathomDashboardPassword },
                ]),
              })
              .finally(() => {
                dispatch(setAppLoading(false));
              })
              .catch((error) => {
                console.error(error);
                toast.error(`Failed to save. \n ${error.message}`);
                return false;
              });
          },
          //disabled: hasErrors,
        },
      ])
    );
  }, [client, dispatch, fathomDashboardPassword, fathomSiteId, refetch]);

  if (!data && !navigator.onLine) {
    return <Offline variant={'centered'} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : data ? (
        <div style={{ padding: 20 }}>
          <div style={{ position: 'relative' }}>
            <H2 theme={theme}>Secrets</H2>
            <Button
              height={28}
              cssExtra={css`
                position: absolute;
                right: 0;
                bottom: -5px;
              `}
              onClick={() => setAreSecretsShown(!areSecretsShown)}
            >
              {areSecretsShown ? `Hide secrets` : `Show secrets`}
            </Button>
          </div>
          <Text
            label={`Fathom site ID`}
            value={areSecretsShown ? fathomSiteId : '**********'}
            onChange={(e) => (areSecretsShown ? setFathomSiteId(e.currentTarget.value) : null)}
            disabled={!areSecretsShown}
            isEmbedded
          />
          <Text
            label={`Fathom dashboard password`}
            value={areSecretsShown ? fathomDashboardPassword : '**********'}
            onChange={(e) => (areSecretsShown ? setFathomDashboardPassword(e.currentTarget.value) : null)}
            disabled={!areSecretsShown}
            isEmbedded
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

const H2 = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 0;
  margin: 36px 0 4px 0;
  font-size: 20px;
  line-height: 28px;
  &:first-of-type {
    margin-top: 14px;
  }
`;

interface SaveMutationType {
  setRawConfigurationCollection?: string | null;
}

function saveMutationString(data: { key: string; value: string }[]): DocumentNode {
  return gql`
    mutation {
      ${data.map(({ key, value }, index) => {
        return `
          setSecret${key.split('.').slice(-1)}: setSecret(key: "${key}", value: "${value}")
        `;
      })}
    }
  `;
}

export { TokenSecretsPage };
