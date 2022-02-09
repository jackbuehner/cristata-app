import { PlansPage } from './pages/plans/PlansPage/PlansPage';
import './App.css';
import styled from '@emotion/styled/macro';
import useAxios, { configure } from 'axios-hooks';
import { SideNavSubButton } from './components/Button';
import { PlansSideNavSub } from './pages/plans/PlansSideNavSub';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import { ItemDetailsPage } from './pages/CMS/ItemDetailsPage';
import { SplashScreen } from './components/SplashScreen';
import { LegacySignIn, SignIn, SignOut } from './pages/SignIn';
import { ProfileSideNavSub } from './pages/profile/ProfileSideNavSub';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SideNavHeading } from './components/Heading';
import { SidenavHeader } from './components/SidenavHeader';
import { Fragment, useState } from 'react';
import { PhotoLibraryPage } from './pages/CMS/PhotoLibraryPage';
import { themeType } from './utils/theme/theme';
import { SidenavSub } from './components/SidenavSub';
import { Sidenav } from './components/Sidenav/Sidenav';
import { HomePage } from './pages/Home';
import { getNavigationConfig } from './config';
import { Titlebar } from './components/Titlebar';
import { ProtocolHandlerPage } from './pages/ProtocolHandlerPage';
import { CollectionPage } from './pages/CMS/CollectionPage';
import { db } from './utils/axios/db';
import { TeamsOverviewPage } from './pages/teams/TeamsOverviewPage';
import { TeamsNav } from './pages/teams/TeamsNav';
import { TeamPage } from './pages/teams/TeamPage';
import { PageHead } from './components/PageHead';
import { useAppSelector } from './redux/hooks';
import { ToastContainer } from './components/ToastContainer';
import { FathomEmbed } from './pages/embeds';
import Color from 'color';
import { useTheme } from '@emotion/react';

// configure axios global settings
configure({ axios: db });

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App() {
  const theme = useTheme() as themeType;
  const authUserState = useAppSelector((state) => state.authUser);
  const [{ data: user, loading: loadingUser, error: errorUser }] = useAxios({
    url: '/auth',
    baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}`,
    withCredentials: true,
    method: 'GET',
  });

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

  return (
    <>
      <ToastContainer />
      <Router>
        <SplashScreen
          loading={loadingUser}
          error={errorUser || undefined}
          user={user}
          persistentChildren={
            <Routes>
              <Route path={`/proto/*`} element={<ProtocolHandlerPage />} />
              <Route path={`/sign-in`} element={<SignIn user={user} loadingUser={loadingUser} />} />
              <Route path={`/sign-in-legacy`} element={<LegacySignIn />} />
              <Route path={`/sign-out`} element={<SignOut />} />
            </Routes>
          }
          protectedChildren={
            <CristataWebSocket>
              {isCustomTitlebarVisible ? <Titlebar /> : null}
              <PageWrapper isCustomTitlebarVisible={isCustomTitlebarVisible}>
                <Wrapper>
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
                                {getNavigationConfig(authUserState).cms.map((group, index) => {
                                  // store the group items that are not hidden
                                  const enabledGroupItems = group.items.filter(
                                    (item) => item.isHidden !== true
                                  );

                                  // if there are no visible items, do not show the group
                                  if (enabledGroupItems.length === 0) return null;

                                  // create the group and its items
                                  return (
                                    <Fragment key={index}>
                                      <SideNavHeading>{group.label}</SideNavHeading>
                                      {enabledGroupItems.map((item, index) => {
                                        return (
                                          <SideNavSubButton
                                            key={index}
                                            Icon={item.icon}
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
                            path={`/plans/*`}
                            element={<PlansSideNavSub setIsNavVisibleM={setIsNavVisibleM} />}
                          />
                          <Route
                            path={`/profile/*`}
                            element={<ProfileSideNavSub setIsNavVisibleM={setIsNavVisibleM} />}
                          />
                          <Route path={`/teams/*`} element={<TeamsNav setIsNavVisibleM={setIsNavVisibleM} />} />
                        </Routes>
                      </SidenavSub>
                    </SideNavs>
                  </SideNavWrapper>
                  <Content theme={theme}>
                    <Routes>
                      <Route path={`/cms/photos/library`} element={<PhotoLibraryPage />} />
                      <Route path={`/cms/photos/library/:photo_id`} element={<PhotoLibraryPage />} />
                      <Route path={`/cms/collection/:collection/:progress`} element={<CollectionPage />} />
                      <Route path={`/cms/collection/:collection`} element={<CollectionPage />} />
                      <Route path={`/cms/item/:collection/:item_id`} element={<ItemDetailsPage />} />
                      <Route path={`/cms`} element={<PageHead title={`CMS`} />} />
                      <Route path={`/plans/org/:id`} element={<PlansPage />} />
                      <Route path={`/plans`} element={<PageHead title={`Plans`} />} />
                      <Route path={`/profile/:profile_id`} element={<ProfilePage />} />
                      <Route path={`/profile`} element={<PageHead title={`Profiles`} />} />
                      <Route path={`/teams/:team_id`} element={<TeamPage />} />
                      <Route path={`/teams`} element={<TeamsOverviewPage />} />
                      <Route
                        path={`/embed/fathom`}
                        element={<FathomEmbed gridCols={gridCols} setGridCols={setGridCols} />}
                      />
                      <Route
                        path={`/`}
                        element={
                          <>
                            <SidenavHeader
                              gridCols={gridCols}
                              homeOnly
                              isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}
                            />
                            <HomePage />
                          </>
                        }
                      />
                    </Routes>
                  </Content>
                </Wrapper>
              </PageWrapper>
            </CristataWebSocket>
          }
        ></SplashScreen>
      </Router>
    </>
  );
}

const PageWrapper = styled.div<{ isCustomTitlebarVisible?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ isCustomTitlebarVisible }) =>
    isCustomTitlebarVisible ? 'calc(100% - env(titlebar-area-height, 33px))' : '100%'};
  position: fixed;
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

export default App;
