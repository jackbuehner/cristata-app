import { SideNavSubButton } from '../../../components/Button';
import { SideNavHeading } from '../../../components/Heading';
import { useGetCollections } from './useGetCollections';

function ConfigurationNavigation() {
  const [collections] = useGetCollections();

  return (
    <>
      <SideNavHeading className={'not-header'}>Billing</SideNavHeading>
      <SideNavSubButton Icon={<></>} to={`/configuration/billing/usage`}>
        Service usage
      </SideNavSubButton>
      <SideNavSubButton Icon={<></>} to={`/configuration/billing/payments`}>
        Payments &amp; invoices
      </SideNavSubButton>
      <SideNavHeading>Security</SideNavHeading>
      <SideNavSubButton Icon={<></>} to={`/configuration/security/tokens-secrets`}>
        Secrets
      </SideNavSubButton>
      <SideNavHeading>Schemas</SideNavHeading>
      {collections?.map(({ name }, index) => {
        return (
          <SideNavSubButton key={index} Icon={<></>} to={`/configuration/schema/${name}`}>
            {name}
          </SideNavSubButton>
        );
      })}
    </>
  );
}

export { ConfigurationNavigation };
