import styled from '@emotion/styled/macro';
import * as fluentIcons from '@fluentui/react-icons';
import Color from 'color';
import { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { IGridCols } from './App';
import './App.css';
import { SideNavSubButton } from './components/Button';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import { SideNavHeading } from './components/Heading';
import { PageHead } from './components/PageHead';
import { Sidenav } from './components/Sidenav/Sidenav';
import { SidenavSub } from './components/SidenavSub';
import { Titlebar } from './components/Titlebar';
import { useNavigationConfig } from './hooks/useNavigationConfig';
import { CollectionItemPage } from './pages/CMS/CollectionItemPage';
import { CollectionPage } from './pages/CMS/CollectionPage';
import { PhotoLibraryPage } from './pages/CMS/PhotoLibraryPage';
import {
  BillingPaymentsPage,
  BillingServiceUsagePage,
  CollectionSchemaPage,
  ConfigurationNavigation,
} from './pages/configuration';
import { FathomEmbed } from './pages/embeds';
import { HomePage } from './pages/Home';
import { Playground, PlaygroundNavigation } from './pages/playground';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ProfileSideNavSub } from './pages/profile/ProfileSideNavSub';
import { TeamPage } from './pages/teams/TeamPage';
import { TeamsNav } from './pages/teams/TeamsNav';
import { TeamsOverviewPage } from './pages/teams/TeamsOverviewPage';
import { isFluentIconComponent } from './utils/isFluentIconComponent';
import { themeType } from './utils/theme/theme';
import { useTheme } from '@emotion/react';

interface ProtectedProps {
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

function Protected(props: ProtectedProps) {
  const theme = useTheme() as themeType;

  const [gridCols, setGridCols] = useState({ side: 79, sideSub: 300 });

  /**
   * Toggles whether the sub side navigation pane is expanded or collapsed
   * @param expandedWidth the width of the sub sidenavigation when expanded
   */
  const toggleSideNavSub = (expandedWidth = 300) => {
    if (gridCols.sideSub > 0) {
      // collapse
      setGridCols({ ...gridCols, sideSub: 0 });
    } else {
      // expand
      setGridCols({ ...gridCols, sideSub: expandedWidth });
    }
  };

  // store whether the nav is shown
  const [isNavVisibleM, setIsNavVisibleM] = useState(false);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  // get the navigation for the cms
  const [cmsNav] = useNavigationConfig('cms');

  return (
    <CristataWebSocket>
      {isCustomTitlebarVisible ? <Titlebar /> : null}
      <PageWrapper isCustomTitlebarVisible={isCustomTitlebarVisible}>
        <Wrapper>
          {window.name === '' ? (
            <SideNavWrapper gridCols={gridCols} isNavVisibleM={isNavVisibleM}>
              <SideNavs>
                <Sidenav
                  gridCols={gridCols}
                  toggleSideNavSub={toggleSideNavSub}
                  isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}
                />
                <SidenavSub gridCols={gridCols} isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}>
                  <Routes>
                    <Route
                      path={`/cms/*`}
                      element={
                        <>
                          <SideNavHeading>Content Management System</SideNavHeading>
                          {cmsNav?.map((group, index) => {
                            return (
                              <Fragment key={index}>
                                <SideNavHeading>{group.label}</SideNavHeading>
                                {group.items.map((item, index) => {
                                  const Icon = fluentIcons[item.icon];
                                  return (
                                    <SideNavSubButton
                                      key={index}
                                      Icon={isFluentIconComponent(Icon) ? <Icon /> : <span />}
                                      to={item.to}
                                      setIsNavVisibleM={setIsNavVisibleM}
                                    >
                                      {item.label}
                                    </SideNavSubButton>
                                  );
                                })}
                              </Fragment>
                            );
                          })}
                        </>
                      }
                    />
                    <Route
                      path={`/profile/*`}
                      element={<ProfileSideNavSub setIsNavVisibleM={setIsNavVisibleM} />}
                    />
                    <Route path={`/teams/*`} element={<TeamsNav setIsNavVisibleM={setIsNavVisibleM} />} />
                    <Route path={`/playground`} element={<PlaygroundNavigation />} />
                    <Route path={`/configuration/*`} element={<ConfigurationNavigation />} />
                    <Route path={`*`} element={<></>} />
                  </Routes>
                </SidenavSub>
              </SideNavs>
            </SideNavWrapper>
          ) : null}
          <Content theme={theme}>
            <Routes>
              <Route path={`/cms`}>
                <Route path={`collection/:collection`}>
                  <Route index element={<CollectionPage />} />
                  <Route path={`:item_id`} element={<CollectionItemPage />} />
                </Route>
                <Route path={`photos/library`}>
                  <Route index element={<PhotoLibraryPage />} />
                  <Route path={`:photo_id`} element={<PhotoLibraryPage />} />
                </Route>
                <Route path={`*`} element={<PageHead title={`CMS`} />} />
              </Route>
              <Route path={`/profile`}>
                <Route index element={<PageHead title={`Profiles`} />} />
                <Route path={`:profile_id`} element={<ProfilePage />} />
              </Route>
              <Route path={`/teams`}>
                <Route index element={<TeamsOverviewPage />} />
                <Route path={`:team_id`} element={<TeamPage />} />
              </Route>
              <Route path={`/playground`} element={<Playground setThemeMode={props.setThemeMode} />} />
              <Route path={`/embed/fathom`} element={<FathomEmbed />} />
              <Route path={`/configuration`}>
                <Route path={`billing`}>
                  <Route path={`usage`} element={<BillingServiceUsagePage />} />
                  <Route path={`payments`} element={<BillingPaymentsPage />} />
                </Route>
                <Route path={`schema/:collection`} element={<CollectionSchemaPage />} />
              </Route>
              <Route path={`/`} element={<HomePage />} />
            </Routes>
          </Content>
        </Wrapper>
      </PageWrapper>
    </CristataWebSocket>
  );
}

const PageWrapper = styled.div<{ isCustomTitlebarVisible?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ isCustomTitlebarVisible }) =>
    isCustomTitlebarVisible ? 'calc(100% - env(titlebar-area-height, 33px))' : '100%'};
  position: fixed;

  @media print {
    height: 100%;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 600px) {
    display: block;
  }
  width: 100%;
  height: 100%;
`;

const SideNavWrapper = styled.div<{
  gridCols: IGridCols;
  isNavVisibleM: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: fit-content;
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  height: 100%;
  //box-shadow: rgb(0 0 0 / 5%) 1px 0px 2px 0px, rgb(0 0 0 / 5%) 4px 0px 8px -2px;
  z-index: 999;
  @media (max-width: 600px) {
    width: 100%;
    height: ${({ isNavVisibleM }) => (isNavVisibleM ? '100%' : 'fit-content')};
    position: ${({ isNavVisibleM }) => (isNavVisibleM ? 'initial' : 'fixed')};
    bottom: ${({ isNavVisibleM }) => (isNavVisibleM ? 'unset' : 0)};
  }
`;

const SideNavs = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 600px) {
    flex-direction: column-reverse;
  }
  height: calc(100%);
`;

const Content = styled.div<{ theme: themeType }>`
  overflow: auto;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  width: 100%;
  height: 100%;

  /* skeleton loader */
  .react-skeleton-load.animated::before {
    background-image: ${({ theme }) =>
      `linear-gradient(90deg, ${Color(theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]).alpha(
        0
      )}, ${Color(theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]).alpha(0.6)}, ${Color(
        theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]
      ).alpha(0)})`};
  }
`;

export { Protected };
