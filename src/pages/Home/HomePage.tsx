import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';
import { AnalyticsChart } from './AnalyticsChart';
import { HomeSectionHeading } from '../../components/Heading';
import { Pulse24Regular, DataUsage24Regular, Megaphone24Regular } from '@fluentui/react-icons';
import { ItemsRow } from './ItemsRow';
import { home as homeConfig } from '../../config';

function HomePage() {
  const theme = useTheme() as themeType;

  return (
    <Grid theme={theme}>
      <div style={{ gridArea: 'analytics', paddingBottom: 0 }}>
        <AnalyticsChart theme={theme}></AnalyticsChart>
      </div>
      <div style={{ gridArea: 'activity' }}>
        <HomeSectionHeading icon={<Pulse24Regular />}>Recent CMS Activty</HomeSectionHeading>
        <code>Insert here the recent activty.</code>
      </div>
      <div style={{ gridArea: 'workflow' }}>
        <HomeSectionHeading icon={<DataUsage24Regular />}>Workflow</HomeSectionHeading>
        <code>
          Insert here the statuses of the items in the CMS. It should be stylized like giant, clickable chips.
        </code>
      </div>
      <div style={{ gridArea: 'row-3' }}>
        <HomeSectionHeading icon={<Megaphone24Regular />}>Welcome to Cristata (Beta)</HomeSectionHeading>
        <p>
          The dashboard is still under construction, but the Content Manager (CMS), Plans, and Profiles are
          already available. Access these tools by using the sidebar on the left.
        </p>
      </div>
      {homeConfig.recentItems.map((item, index: number) => {
        return (
          <div style={{ gridArea: `row-${index + 4}`, overflowX: 'auto', height: 'max-content' }} key={index}>
            <HomeSectionHeading icon={item.icon}>{item.label}</HomeSectionHeading>
            <ItemsRow data={item.data} keys={item.keys} toPrefix={item.toPrefix} isProfile={item.isProfile} />
          </div>
        );
      })}
    </Grid>
  );
}

const Grid = styled.div<{ theme: themeType }>`
  height: calc(100% - 40px);
  box-sizing: border-box;
  overflow: hidden auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 400px 1fr;
  grid-template-areas:
    'analytics analytics'
    'activity workflow'
    'row-3 row-3'
    'row-4 row-4'
    'row-5 row-5'
    'row-6 row-6';
  > div {
    border-bottom: 1px solid;
    border-color: ${({ theme }) =>
      theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
    padding: 20px;
    font-family: ${({ theme }) => theme.font.detail};
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  }
`;

export { HomePage };