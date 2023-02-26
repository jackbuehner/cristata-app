import { useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { gql } from 'graphql-tag';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/ContentField';
import { Offline } from '../../../components/Offline';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { server } from '../../../utils/constants';
import type { themeType } from '../../../utils/theme/theme';
import { useGetBillingStatus } from './useGetBillingStatus';

function BillingPaymentsPage() {
  const dispatch = useAppDispatch();
  const [data, loading, error, refetch] = useGetBillingStatus();
  const [message, setMessage] = useState('');
  let [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get('canceled')) {
      setSuccess(false);
      setMessage('Subsription canceled');
    }
  }, []);

  // set document title
  useEffect(() => {
    document.title = `Payments & invoices`;
  }, []);

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(loading));
  }, [dispatch, loading]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('Payments & invoices'));
    dispatch(
      setAppActions([
        {
          label: 'Refresh data',
          type: 'icon',
          icon: 'ArrowClockwise24Regular',
          action: () => refetch(),
        },
      ])
    );
  }, [dispatch, refetch]);

  if (!data && !navigator.onLine) {
    return <Offline variant={'centered'} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 20 }}>
        {
          // show the error if there is one
          error ? (
            <pre>{JSON.stringify(error, null, 2)}</pre>
          ) : // show nothing while the page is loading
          loading ? (
            <></>
          ) : // show the billing portal if the subscription is active
          data?.subscription_active ? (
            <PortalDisplay features={data.features} refetch={refetch} />
          ) : // show the subscription button if there is no subscription
          !success && message === '' ? (
            <ProductDisplay customerId={data?.stripe_customer_id} />
          ) : (
            // show the message
            <Message message={message} />
          )
        }
      </div>
    </div>
  );
}

interface ProductDisplayProps {
  customerId?: string;
}

function ProductDisplay(props: ProductDisplayProps) {
  const theme = useTheme() as themeType;

  return (
    <section>
      <H2 theme={theme}>You are currently in trial mode.</H2>
      <Description theme={theme}>
        Start paying for Cristata to create unlimited documents and users and access your data from anywhere.
      </Description>
      <form
        style={{ marginTop: 10 }}
        action={`${server.location}/stripe/create-checkout-session`}
        method={'POST'}
      >
        <Button type={'submit'}>Subscribe</Button>
      </form>
      {props.customerId ? (
        <>
          <form
            style={{ marginTop: 10 }}
            action={`${server.location}/stripe/create-portal-session`}
            method={'POST'}
          >
            <Button type={'submit'}>Manage your billing information</Button>
          </form>
          <form
            style={{ marginTop: 10 }}
            action={`${server.location}/stripe/create-portal-session`}
            method={'POST'}
          >
            <Button type={'submit'}>View invoices</Button>
          </form>
        </>
      ) : null}
    </section>
  );
}

interface PortalDisplayProps {
  features: {
    allowDiskUse: boolean;
  };
  refetch: () => void;
}

function PortalDisplay(props: PortalDisplayProps) {
  const theme = useTheme() as themeType;
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  return (
    <section>
      <H2 theme={theme}>You are currently subscribed to Cristata.</H2>
      <Description theme={theme}>Thank you!</Description>
      <form
        style={{ marginTop: 10 }}
        action={`${server.location}/stripe/create-portal-session`}
        method={'POST'}
      >
        <Button type={'submit'}>Manage your billing information</Button>
      </form>
      <form
        style={{ marginTop: 10 }}
        action={`${server.location}/stripe/create-portal-session`}
        method={'POST'}
      >
        <Button type={'submit'}>View invoices</Button>
      </form>
      <div>
        <Checkbox
          isEmbedded
          label={`Allow using disk space when query memory exceeds the limit ($0.03 / hour)`}
          description={`This ensures that high-memory queries can finish executing. It is only necessary to enable if your queries get the <code>QueryExceededMemoryLimitNoDiskUseAllowed</code> error.`}
          checked={props.features.allowDiskUse}
          onChange={(evt) => {
            dispatch(setAppLoading(true));
            client
              .mutate({
                mutation: gql`
                  mutation SetAllowDiskUse($allowDiskUse: Boolean!) {
                    billing {
                      features {
                        allowDiskUse(allowDiskUse: $allowDiskUse)
                      }
                    }
                  }
                `,
                variables: { allowDiskUse: evt.target.checked },
              })
              .finally(() => {
                dispatch(setAppLoading(false));
              })
              .then(() => {
                props.refetch();
              })
              .catch(() => {
                toast.error('Failed to change disk use subscription setting');
              });
          }}
        />
      </div>
    </section>
  );
}

function Message({ message }: { message: string }) {
  const theme = useTheme() as themeType;

  return (
    <section>
      <H2 theme={theme}>{message}</H2>
    </section>
  );
}

const H2 = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 0;
  margin: 14px 0 4px 0;
  font-size: 20px;
  line-height: 28px;
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

export { BillingPaymentsPage };
