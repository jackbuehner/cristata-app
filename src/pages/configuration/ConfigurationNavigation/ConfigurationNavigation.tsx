import { SideNavSubButton } from '../../../components/Button';
import FluentIcon from '../../../components/FluentIcon';
import { SideNavHeading } from '../../../components/Heading';
import { Offline } from '../../../components/Offline';
import { useGetCollections } from './useGetCollections';

function ConfigurationNavigation() {
  const [collections] = useGetCollections();

  return (
    <>
      <SideNavHeading className={'not-header'}>Billing</SideNavHeading>
      <SideNavSubButton Icon={<FluentIcon name={'TopSpeed20Regular'} />} to={`/configuration/billing/usage`}>
        Service usage
      </SideNavSubButton>
      <SideNavSubButton
        Icon={<FluentIcon name={'ReceiptMoney20Regular'} />}
        to={`/configuration/billing/payments`}
      >
        Payments &amp; invoices
      </SideNavSubButton>
      <SideNavHeading>Security</SideNavHeading>
      <SideNavSubButton
        Icon={<FluentIcon name={'Key20Regular'} />}
        to={`/configuration/security/tokens-secrets`}
      >
        Secrets
      </SideNavSubButton>
      <SideNavHeading>Schemas</SideNavHeading>
      {(!collections || collections?.length === 0) && !navigator.onLine ? (
        <Offline variant={'small'} />
      ) : (
        collections?.map(({ name }, index) => {
          return (
            <SideNavSubButton
              key={index}
              Icon={<FluentIcon name={'CircleSmall20Filled'} />}
              to={`/configuration/schema/${name}`}
            >
              {name}
            </SideNavSubButton>
          );
        })
      )}
    </>
  );
}

export { ConfigurationNavigation };
