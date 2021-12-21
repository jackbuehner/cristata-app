/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../utils/theme/theme';
import { AnalyticsChart } from './AnalyticsChart';
import { HomeSectionHeading } from '../../components/Heading';
import {
  Pulse24Regular,
  DataUsage24Regular,
  Megaphone24Regular,
  Edit24Regular,
  MailInbox24Regular,
  Clock24Regular,
  Checkmark24Regular,
  Document24Regular,
} from '@fluentui/react-icons';
import { ItemsRow } from './ItemsRow';
import { home as homeConfig } from '../../config';
import { WorkflowStatusCard } from './WorkflowStatusCard';
import { RecentActivity } from './RecentActivity';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { STAGE_COUNTS, STAGE_COUNTS__TYPE } from '../../graphql/queries';

function HomePage() {
  const theme = useTheme() as themeType;

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

  // set document title
  useEffect(() => {
    document.title = `Cristata`;
  }, []);

  return (
    <Grid theme={theme}>
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
        <HomeSectionHeading icon={<Pulse24Regular />}>Recent CMS Activty</HomeSectionHeading>
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
          The dashboard is still under construction, but the Content Manager (CMS), Plans, and Profiles are
          already available. Access these tools by using the sidebar on the left.
        </p>
      </div>
      {homeConfig.recentItems.map((item, index: number) => {
        return (
          <div
            style={{
              gridArea: `row-${index + 4}`,
              overflowX: 'auto',
              height: 'max-content',
            }}
            key={index}
          >
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
  @media (max-width: 600px) {
    height: ${({ theme }) => `calc(100% - 40px - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
  overflow: hidden auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 400px 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas:
    'analytics analytics'
    'activity workflow'
    'announcement announcement'
    'row-4 row-4'
    'row-5 row-5'
    'row-6 row-6';
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 1fr 1fr 1fr 300px 1fr 1fr 1fr;
    grid-template-areas:
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
