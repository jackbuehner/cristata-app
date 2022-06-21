/** @jsxImportSource @emotion/react */
import { useQuery } from '@apollo/client';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import * as fluentIcons from '@fluentui/react-icons';
import {
  AppFolder24Regular,
  Checkmark24Regular,
  Clock24Regular,
  DataUsage24Regular,
  Document24Regular,
  Edit24Regular,
  MailInbox24Regular,
  Megaphone24Regular,
  Pulse24Regular,
} from '@fluentui/react-icons';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { HomeSectionHeading } from '../../components/Heading';
import { STAGE_COUNTS, STAGE_COUNTS__TYPE } from '../../graphql/queries';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';
import { useAppDispatch } from '../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../redux/slices/appbarSlice';
import { isFluentIconComponent } from '../../utils/isFluentIconComponent';
import { themeType } from '../../utils/theme/theme';
import { AnalyticsChart } from './AnalyticsChart';
import { ItemsRow } from './ItemsRow';
import { RecentActivity } from './RecentActivity';
import { WorkflowStatusCard } from './WorkflowStatusCard';

function HomePage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const navigate = useNavigate();

  const { data: workflowStagesAll } = useQuery<STAGE_COUNTS__TYPE>(STAGE_COUNTS, { fetchPolicy: 'no-cache' });
  const workflowStages = [].concat(...(Object.values({ ...workflowStagesAll }) as any)) as {
    _id: number;
    count: number;
  }[];
  const stages = workflowStages?.reduce(
    (obj: { [key: number]: number }, item) =>
      Object.assign(obj, { [item._id]: (obj[item._id] || 0) + item.count }),
    {}
  );
  const [mainNav] = useNavigationConfig('main');

  // set document title
  useEffect(() => {
    document.title = `Cristata`;
  }, []);

  const [collectionRowsConfig] = useDashboardConfig('collectionRows');

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
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {mainNav
            ?.filter((item) => item.to !== '/')
            .map((item, index) => {
              const Icon = fluentIcons[item.icon];

              return (
                <Button
                  key={index}
                  icon={isFluentIconComponent(Icon) ? <Icon /> : undefined}
                  height={80}
                  onClick={() => {
                    navigate(item.to);
                  }}
                  cssExtra={css`
                    padding: 0;
                    width: 80px;
                    flex-direction: column;
                    gap: 10px;
                    > span.IconStyleWrapper {
                      margin: 0;
                      width: 24px;
                      height: 24px;
                      svg {
                        width: 24px;
                        height: 24px;
                      }
                    }
                  `}
                >
                  {item.label}
                </Button>
              );
            })}
        </div>
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
        {stages ? (
          <>
            <WorkflowStatusCard
              icon={<Document24Regular />}
              color={'neutral'}
              count={
                (stages[1.1] || 0) +
                (stages[2.1] || 0) +
                (stages[3.1] || 0) +
                (stages[3.3] || 0) +
                (stages[3.5] || 0) +
                (stages[4.1] || 0) +
                (stages[5.1] || 0) +
                (stages[5.2] || 0)
              }
              to={`/cms/articles/in-progress`}
            >
              All entries
            </WorkflowStatusCard>
            <WorkflowStatusCard
              icon={<Edit24Regular />}
              color={'indigo'}
              count={(stages[1.1] || 0) + (stages[2.1] || 0)}
              to={`/cms/articles/in-progress`}
            >
              Drafts
            </WorkflowStatusCard>
            <WorkflowStatusCard
              icon={<MailInbox24Regular />}
              color={'red'}
              count={(stages[3.1] || 0) + (stages[3.3] || 0) + (stages[3.5] || 0)}
              to={`/cms/articles/in-progress`}
            >
              In review
            </WorkflowStatusCard>
            <WorkflowStatusCard
              icon={<Clock24Regular />}
              color={'orange'}
              count={stages[4.1] || 0}
              to={`/cms/articles/in-progress`}
            >
              Ready
            </WorkflowStatusCard>
            <WorkflowStatusCard
              icon={<Checkmark24Regular />}
              color={'green'}
              count={(stages[5.1] || 0) + (stages[5.2] || 0)}
              to={`/cms/articles/all`}
            >
              Published
            </WorkflowStatusCard>
          </>
        ) : null}
      </div>
      <div style={{ gridArea: 'announcement' }}>
        <HomeSectionHeading icon={<Megaphone24Regular />}>Welcome to Cristata (Beta)</HomeSectionHeading>
        <p>
          The dashboard is still under construction, but the Content Manager (CMS), Teams, and Profiles are
          already available. Access these tools by using the sidebar on the left.
        </p>
      </div>
      {collectionRowsConfig?.map((item, index: number) => {
        const Icon = fluentIcons[item.header.icon];
        return (
          <div
            style={{
              gridArea: `row-${index + 4}`,
              overflowX: 'auto',
              height: 'max-content',
            }}
            key={index}
          >
            <HomeSectionHeading icon={isFluentIconComponent(Icon) ? <Icon /> : <span />}>
              {item.header.label}
            </HomeSectionHeading>
            <ItemsRow query={item.query} dataKeys={item.dataKeys} arrPath={item.arrPath} to={item.to} />
          </div>
        );
      })}
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
