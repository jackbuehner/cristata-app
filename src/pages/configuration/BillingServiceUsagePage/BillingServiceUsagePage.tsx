import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import { IconButton } from '../../../components/Button';
import { PageHead } from '../../../components/PageHead';
import { formatISODate } from '../../../utils/formatISODate';
import { themeType } from '../../../utils/theme/theme';
import { useGetServiceUsage } from './useGetServiceUsage';
function BillingServiceUsagePage() {
  const theme = useTheme() as themeType;
  const [data, loading, error, refetch] = useGetServiceUsage(6, 2022);

  // set document title
  useEffect(() => {
    document.title = `Service usage`;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHead
        title={'Service usage'}
        isLoading={loading}
        buttons={
          <>
            <IconButton icon={<ArrowClockwise24Regular />} data-tip={`Reload`} onClick={() => refetch()} />
          </>
        }
      />

      {error ? (
        <pre>{JSON.stringify(error, null, 2)}</pre>
      ) : data ? (
        <div style={{ padding: 20 }}>
          <H2 theme={theme}>API usage</H2>
          <Description theme={theme}>
            Every time a website or app requests data from the Cristata API, we record that the request occured.
            Each query requires effort from our servers, so we add a small fee for each query made outside of
            Cristata apps (e.g. your website) so that we can keep the servers running.
            {data.usage.api ? (
              <div style={{ marginTop: 4 }}>
                <i>Since {formatISODate(data.usage.api?.since, false, true, true)}</i>
              </div>
            ) : null}
          </Description>
          <H3 theme={theme}>Billable queries</H3>
          <Number theme={theme}>
            {typeof data?.usage?.api?.billable === 'number' ? data.usage.api.billable : '-'}
          </Number>
          <H3 theme={theme}>Total queries</H3>
          <Number theme={theme}>
            {typeof data?.usage?.api?.total === 'number' ? data.usage.api.total : '-'}
          </Number>

          <H2 theme={theme}>Storage</H2>
          <Description theme={theme}>
            Your content takes up a lot of space! To keep costs fair, we only charge you for the space that you
            use - not the space that you might use. Keeps tabs on how much space you are consuming here.
          </Description>
          <H3 theme={theme}>Database</H3>
          <Number theme={theme}>{(data?.usage?.storage.database / 1000000000).toFixed(2) || '-'} GB</Number>
          <H3 theme={theme}>Files</H3>
          <Number theme={theme}>{(data?.usage?.storage.files / 1000000000).toFixed(2) || '-'} GB</Number>
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

const H3 = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 0;
  margin: 10px 0 0 0;
  font-size: 16px;
  line-height: 22px;
`;

const Description = styled.p<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 0;
  margin: 0;
  font-size: 14px;
  line-height: 18px;
`;

const Number = styled.p<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 0;
  margin: 0;
  font-size: 14px;
  line-height: 16px;
`;

export { BillingServiceUsagePage };