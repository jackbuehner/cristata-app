import { PlansPage } from './pages/plans/PlansPage/PlansPage';
import { theme } from './utils/theme';
import './App.css';
import styled from '@emotion/styled/macro';
import useAxios, { configure } from 'axios-hooks';
import { SideNavSubButton } from './components/Button';
import { PlansSideNavSub } from './pages/plans/PlansSideNavSub';
import { Dismiss16Regular } from '@fluentui/react-icons';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
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
import Color from 'color';
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

// configure axios global settings
configure({ axios: db });

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App() {
  const state = useAppSelector((state) => state);
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

  const StyledToastContainer = styled(ToastContainer)<{
    appTheme: themeType;
    icon?: false | React.ReactNode;
  }>`
    top: ${({ appTheme }) => `calc(${appTheme.dimensions.PageHead.height} + 6px)`};
    .Toastify__toast {
      border-radius: ${({ appTheme }) => appTheme.radius};
      padding: 0;
      background-color: ${({ appTheme }) => (appTheme.mode === 'light' ? 'white' : 'black')};
      color: ${({ appTheme }) => appTheme.color.neutral[appTheme.mode][1400]};
      font-family: ${({ appTheme }) => appTheme.font.detail};
      font-size: 15px;
      &::before {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        background-color: ${({ appTheme }) => (appTheme.mode === 'light' ? 'white' : 'black')};
      }
    }
    .Toastify__toast--error {
      &::before {
        content: '❌';
        border-left: ${({ appTheme }) => `3px solid ${appTheme.color.danger[800]}`};
      }
    }
    .Toastify__toast--warning {
      &::before {
        content: '❗';
        border-left: ${({ appTheme }) => `3px solid ${appTheme.color.orange[800]}`};
      }
    }
    .Toastify__toast--success {
      &::before {
        content: '✅';
        border-left: ${({ appTheme }) => `3px solid ${appTheme.color.success[800]}`};
      }
    }
    .Toastify__toast-body {
      width: 100%;
      padding-left: 0;
    }
    .Toastify__progress-bar {
      background-color: ${({ appTheme }) =>
        Color(appTheme.color.neutral[appTheme.mode][800]).alpha(0.25).string()};
      height: 3px;
    }
  `;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <>
      <StyledToastContainer
        appTheme={theme}
        icon={false}
        closeButton={
          <span style={{ margin: '8px 8px 0 0' }}>
            <Dismiss16Regular />
          </span>
        }
      />
      <Router>
        <SplashScreen
          loading={loadingUser}
          error={errorUser || undefined}
          user={user}
          persistentChildren={
            <Routes>
              <Route path={`/proto*`} element={<ProtocolHandlerPage />} />
              <Route path={`/sign-in`} element={<SignIn user={user} loadingUser={loadingUser} />} />
              <Route path={`/sign-in-legacy`} element={<LegacySignIn />} />
            </Routes>
          }
          protectedChildren={
            <CristataWebSocket>
              {isCustomTitlebarVisible ? <Titlebar /> : null}
              <PageWrapper isCustomTitlebarVisible={isCustomTitlebarVisible}>
                <Wrapper>
                  <Routes>
                    <Route path={`/sign-out`} element={<SignOut />} />
                    <Route>
                      <SideNavWrapper gridCols={gridCols} isNavVisibleM={isNavVisibleM}>
                        <SideNavs>
                          <Sidenav
                            gridCols={gridCols}
                            toggleSideNavSub={toggleSideNavSub}
                            isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}
                          />
                          <SidenavSub gridCols={gridCols} isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}>
                            <Routes>
                              <Route path={`/cms`}>
                                <SideNavHeading>Content Management System</SideNavHeading>
                                {getNavigationConfig(state).cms.map((group, index) => {
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
                              </Route>
                              <Route path={`/plans`}>
                                <PlansSideNavSub setIsNavVisibleM={setIsNavVisibleM} />
                              </Route>
                              <Route path={`/profile`}>
                                <ProfileSideNavSub setIsNavVisibleM={setIsNavVisibleM} />
                              </Route>
                              <Route path={`/teams`}>
                                <TeamsNav setIsNavVisibleM={setIsNavVisibleM} />
                              </Route>
                            </Routes>
                          </SidenavSub>
                        </SideNavs>
                      </SideNavWrapper>
                      <Content theme={theme}>
                        <Routes>
                          <Route path={`/cms/photos/library/:photo_id?`}>
                            <PhotoLibraryPage />
                          </Route>
                          <Route path={`/cms/collection/:collection/:progress`}>
                            <CollectionPage />
                          </Route>
                          <Route path={`/cms/collection/:collection`}>
                            <CollectionPage />
                          </Route>
                          <Route path={`/cms/item/:collection/:item_id`}>
                            <ItemDetailsPage />
                          </Route>
                          <Route path={`/cms`}>
                            <PageHead title={`CMS`} />
                          </Route>
                          <Route path={`/plans/org/:id`}>
                            <PlansPage />
                          </Route>
                          <Route path={`/plans`}>
                            <PageHead title={`Plans`} />
                          </Route>
                          <Route path={`/profile/:profile_id`}>
                            <ProfilePage />
                          </Route>
                          <Route path={`/profile`}>
                            <PageHead title={`Profiles`} />
                          </Route>
                          <Route path={`/teams/:team_id`}>
                            <TeamPage />
                          </Route>
                          <Route path={`/teams`}>
                            <TeamsOverviewPage />
                          </Route>
                          <Route path={`/`}>
                            <SidenavHeader
                              gridCols={gridCols}
                              homeOnly
                              isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}
                            />
                            <HomePage />
                          </Route>
                        </Routes>
                      </Content>
                    </Route>
                  </Routes>
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
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  width: 100%;
  height: 100%;
`;

export default App;
