/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
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
import { RecentActivity } from './RecentActivity';
import { Workflow } from './Workflow';
import { CollectionRows } from './CollectionRows';
import { AppsList } from './AppsList';

function HomePage() {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;
  const tenant = localStorage?.getItem('tenant');

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
    <Grid tenant={tenant}>
      <div style={{ gridArea: 'apps' }}>
        <HomeSectionHeading icon={<AppFolder24Regular />}>Your apps</HomeSectionHeading>
        <AppsList />
      </div>
      <div style={{ gridArea: 'announcement' }}>
        <HomeSectionHeading icon={<Megaphone24Regular />}>
          What's new to Cristata (January 2023)
        </HomeSectionHeading>
        <ul style={{ paddingInlineStart: 14, lineHeight: 1.5 }}>
          <li>Added the workflow page for easy access to all in-progress documents across all collections.</li>
          <li>Added the ability to switch between accounts in different tenants in the profile menu.</li>
          <li>Enabled a dark scrollbar in dark mode.</li>
          <li>Add toast notifications when there is a Cristata app update.</li>
          <li>
            Changed the <i>Publish</i> button to an <i>Unpublish</i> button when documents are published.
          </li>
          <li>
            Included a <i>Last published</i> column in collection tables.
          </li>
          <li>Added the ability to add custom groups to the CMS navigation pane.</li>
          <li>
            Added new options for collection configurations:
            <ul>
              <li>
                Configure exact previews of how your documents will appear on your website. A preview tab will
                appear in the document editor when this option is enabled.
              </li>
              <li>Choose the plural label for collections, used in the CMS navigation pane.</li>
              <li>Add scope tags to collection labels.</li>
              <li>Use custom document name templates.</li>
              <li>
                Choose to edit a separate copy of published documents so your changes do not go live until they
                are ready.
              </li>
            </ul>
          </li>
          <li>
            Added the <i>Files</i> system collection. Every uploaded file recieves a link to view/download the
            file.
          </li>
          <li>
            Added the <i>Photos</i> system collection. Every uploaded photo can be viewed from anywhere using
            its link.
          </li>
        </ul>
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
      <CollectionRows firstRowIndex={4} />
    </Grid>
  );
}

const Grid = styled.div<{ tenant: string | null | undefined }>`
  height: 100%;
  @media (max-width: 600px) {
    height: ${({ theme }) => `calc(100% - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
  overflow: hidden auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas:
    'apps apps'
    'announcement announcement'
    'activity workflow'
    'row-4 row-4'
    'row-5 row-5'
    'row-6 row-6';
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas:
      'apps'
      'announcement'
      'activity'
      'workflow'
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
