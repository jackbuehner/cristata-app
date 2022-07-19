import styled from '@emotion/styled/macro';
import { SidebarSchemaCard } from './SidebarSchemaCard';

interface SidebarProps {
  activeTabIndex: number;
}

function Sidebar(props: SidebarProps) {
  return (
    <div style={{ padding: 20, height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
      {props.activeTabIndex === 0 ? (
        <>
          <Heading>Add fields</Heading>
          <SidebarSchemaCard label={'Text'} icon={'text'} />
          <SidebarSchemaCard label={'Rich text'} icon={'richtext'} />
          <SidebarSchemaCard label={'Integer'} icon={'number'} />
          <SidebarSchemaCard label={'Float'} icon={'decimal'} />
          <SidebarSchemaCard label={'Boolean'} icon={'boolean'} />
          <SidebarSchemaCard label={'Reference'} icon={'reference'} />
          <SidebarSchemaCard label={'Date and time'} icon={'datetime'} />
          <SidebarSchemaCard label={'Unique ID'} icon={'objectid'} />
        </>
      ) : null}
      <Heading>Help</Heading>
      <Link
        href={
          'https://www.mongodb.com/docs/v5.3/tutorial/query-documents/#std-label-read-operations-query-argument'
        }
      >
        MongoDB query syntax
      </Link>
      <Link
        href={
          'https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/#aggregation-pipeline-stages'
        }
      >
        Pipeline stage reference
      </Link>
    </div>
  );
}

const Heading = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 30px 0 10px 0;
  &:first-of-type {
    margin-top: 10px;
  }
`;

const Link = styled.a`
  display: flex;
  padding: 4px 0;
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

export { Sidebar };
