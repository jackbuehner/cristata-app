/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import {
  AppFolder24Regular,
  DataUsage24Regular,
  Megaphone24Regular,
  Pulse24Regular,
} from '@fluentui/react-icons';
import { useEffect } from 'react';
import { HomeSectionHeading } from '../../components/Heading';
import { useAppDispatch } from '../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../redux/slices/appbarSlice';
import { themeType } from '../../utils/theme/theme';
import { AnalyticsChart } from './AnalyticsChart';
import { RecentActivity } from './RecentActivity';
import { Workflow } from './Workflow';
import { CollectionRows } from './CollectionRows';
import { AppsList } from './AppsList';

function HomePage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;

  // set document title
  useEffect(() => {
    document.title = `Cristata`;
  }, []);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName('Cristata'));
    dispatch(setAppActions([]));
    dispatch(setAppLoading(false));
  }, [dispatch]);

  return (
    <Grid theme={theme}>
      <div style={{ gridArea: 'apps' }}>
        <HomeSectionHeading icon={<AppFolder24Regular />}>Your apps</HomeSectionHeading>
        <AppsList />
      </div>
      <div style={{ gridArea: 'analytics', paddingBottom: 0 }}>
        <AnalyticsChart theme={theme}></AnalyticsChart>
      </div>
      <div
        css={css`
          grid-area: activity;
          border-right: 1px solid
            ${theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
          @media (max-width: 600px) {
            border-right: none;
          }
        `}
      >
        <HomeSectionHeading icon={<Pulse24Regular />}>Recent activty</HomeSectionHeading>
        <RecentActivity />
      </div>
      <div style={{ gridArea: 'workflow' }}>
        <HomeSectionHeading icon={<DataUsage24Regular />}>Workflow</HomeSectionHeading>
        <Workflow />
      </div>
      <div style={{ gridArea: 'announcement' }}>
        <HomeSectionHeading icon={<Megaphone24Regular />}>Welcome to Cristata (Beta)</HomeSectionHeading>
        <p>
          The dashboard is still under construction, but the Content Manager (CMS), Teams, and Profiles are
          already available. Access these tools by using the sidebar on the left.
        </p>
      </div>
      <CollectionRows firstRowIndex={4} />
    </Grid>
  );
}

const Grid = styled.div<{ theme: themeType }>`
  height: 100%;
  @media (max-width: 600px) {
    height: ${({ theme }) => `calc(100% - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
  overflow: hidden auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 1fr 400px 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas:
    'apps apps'
    'analytics analytics'
    'activity workflow'
    'announcement announcement'
    'row-4 row-4'
    'row-5 row-5'
    'row-6 row-6';
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 1fr 1fr 1fr 1fr 300px 1fr 1fr 1fr;
    grid-template-areas:
      'apps'
      'announcement'
      'activity'
      'workflow'
      'analytics'
      'row-4'
      'row-5'
      'row-6';
  }
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
