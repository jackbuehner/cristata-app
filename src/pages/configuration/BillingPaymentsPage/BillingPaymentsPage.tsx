import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { PageHead } from '../../../components/PageHead';
import { themeType } from '../../../utils/theme/theme';
import { useGetBillingStatus } from './useGetBillingStatus';

function BillingPaymentsPage() {
  const [data, loading, error] = useGetBillingStatus();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHead title={'Payments & invoices'} isLoading={loading} />
      <div style={{ padding: 20 }}>
        {
          // show the error if there is one
          error ? (
            <pre>{JSON.stringify(error, null, 2)}</pre>
          ) : // show the billing portal if the subscription is active
          data?.subscription_active ? (
            <PortalDisplay />
          ) : // show the subscription button if there is no subscription
          !success && message === '' ? (
            <ProductDisplay />
          ) : (
            // show the message
            <Message message={message} />
          )
        }
      </div>
    </div>
  );
}

function ProductDisplay() {
  const theme = useTheme() as themeType;

  return (
    <section>
      <H2 theme={theme}>You are currently in trial mode.</H2>
      <Description theme={theme}>
        Start paying for Cristata to create unlimited documents and users and access your data from anywhere.
      </Description>
      <form
        style={{ marginTop: 10 }}
        action={
          'https://3000-jackbuehner-cristataapi-3ekrx0mwzql.ws-us46.gitpod.io/stripe/create-checkout-session'
        }
        method={'POST'}
      >
        <Button type={'submit'}>Checkout</Button>
      </form>
    </section>
  );
}

function PortalDisplay() {
  const theme = useTheme() as themeType;

  return (
    <section>
      <H2 theme={theme}>You are currently subscribed to Cristata.</H2>
      <Description theme={theme}>Thank you!</Description>
      <form
        style={{ marginTop: 10 }}
        action={
          'https://3000-jackbuehner-cristataapi-3ekrx0mwzql.ws-us46.gitpod.io/stripe/create-portal-session'
        }
        method={'POST'}
      >
        <Button type={'submit'}>Manage your billing information</Button>
      </form>
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
