import styled from '@emotion/styled/macro';
import { Button, SideNavSubButton } from '../../../components/Button';
import FluentIcon from '../../../components/FluentIcon';
import { SideNavHeading } from '../../../components/Heading';
import { Offline } from '../../../components/Offline';
import { useCreateSchema } from '../CollectionSchemaPage/hooks/schema-modals/useCreateSchema';
import { useGetCollections } from './useGetCollections';

function ConfigurationNavigation() {
  const [collections] = useGetCollections();
  const [CreateWindow, showCreateWindow] = useCreateSchema(collections?.map((col) => col.name) || []);

  return (
    <Wrapper>
      {CreateWindow}
      <div style={{ height: 300 }}>
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
        <SideNavHeading>System collections</SideNavHeading>
        <SideNavSubButton
          Icon={<FluentIcon name={'CircleSmall20Filled'} />}
          to={`/configuration/system-collection/File/action-access`}
        >
          Files
        </SideNavSubButton>
        <SideNavHeading>Schemas</SideNavHeading>
        {(!collections || collections?.length === 0) && !navigator.onLine ? (
          <Offline variant={'small'} />
        ) : (
          [...(collections || [])]
            ?.sort((a, b) => a.name.localeCompare(b.name))
            .map(({ name }, index) => {
              return (
                <SideNavSubButton
                  key={index}
                  Icon={<FluentIcon name={'CircleSmall20Filled'} />}
                  to={`/configuration/schema/${name}#0`}
                >
                  {name}
                </SideNavSubButton>
              );
            })
        )}
      </div>
      <Actions>
        <Button onClick={showCreateWindow}>New schema</Button>
      </Actions>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-itmes: flex-start;
  justify-content: flex-start;
  height: 100%;
  > div:nth-of-type(1) {
    flex-grow: 1;
    height: 0;
    overflow: auto;
  }
  > div:nth-of-type(2) {
    flex-shrink: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  width: 100%;
  gap: 6px;
  border-top: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  padding: 16px 16px;
  box-sizing: border-box;
  justify-content: flex-end;
`;

export { ConfigurationNavigation };
