import { PlansPage } from './pages/plans/PlansPage/PlansPage';
import { theme } from './utils/theme';
import './App.css';
import styled from '@emotion/styled/macro';
import useAxios, { configure } from 'axios-hooks';
import { SideNavSubButton } from './components/Button';
import { PlansSideNavSub } from './pages/plans/PlansSideNavSub';
import { Dismiss16Regular } from '@fluentui/react-icons';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import { ItemDetailsPage } from './pages/CMS/ItemDetailsPage';
import { SplashScreen } from './components/SplashScreen';
import { LegacySignIn, SignIn } from './pages/SignIn';
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
import { navigation } from './config';
import { Titlebar } from './components/Titlebar';
import { ProtocolHandlerPage } from './pages/ProtocolHandlerPage';
import { CollectionPage } from './pages/CMS/CollectionPage';
import { db } from './utils/axios/db';
import { TeamsOverviewPage } from './pages/teams/TeamsOverviewPage';
import { TeamsNav } from './pages/teams/TeamsNav';
import { TeamPage } from './pages/teams/TeamPage';

// configure axios global settings
configure({ axios: db });

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App() {
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

  const StyledToastContainer = styled(ToastContainer)<{ theme: themeType }>`
    top: ${({ theme }) => `calc(${theme.dimensions.PageHead.height} + 6px)`};
    .Toastify__toast {
      border-radius: ${({ theme }) => theme.radius};
      padding: 0;
      background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
      color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
      font-family: ${({ theme }) => theme.font.detail};
      font-size: 15px;
      &::before {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
      }
    }
    .Toastify__toast--error {
      &::before {
        content: '❌';
        border-left: ${({ theme }) => `3px solid ${theme.color.danger[800]}`};
      }
    }
    .Toastify__toast--warning {
      &::before {
        content: '❗';
        border-left: ${({ theme }) => `3px solid ${theme.color.orange[800]}`};
      }
    }
    .Toastify__toast--success {
      &::before {
        content: '✅';
        border-left: ${({ theme }) => `3px solid ${theme.color.success[800]}`};
      }
    }
    .Toastify__toast-body {
      width: 100%;
      padding-left: 0;
    }
    .Toastify__progress-bar {
      background-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][800]).alpha(0.25).string()};
      height: 3px;
    }
  `;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <>
      <CristataWebSocket>
        <StyledToastContainer
          theme={theme}
          closeButton={
            <span style={{ margin: '8px 8px 0 0' }}>
              <Dismiss16Regular />
            </span>
          }
        />
        <Router>
          <SplashScreen loading={loadingUser} error={errorUser} user={user} />
          <Switch>
            <Route path={`/proto`}>
              <ProtocolHandlerPage />
            </Route>
            <Route path={`/sign-in`} exact>
              <SignIn />
            </Route>
            <Route path={`/sign-in-legacy`} exact>
              <LegacySignIn />
            </Route>
            <Route
              path={`/sign-out`}
              exact
              component={() => {
                window.location.href = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/auth/clear`;
                return null;
              }}
            />
            <Route>
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
                        <Switch>
                          <Route path={`/cms`}>
                            <SideNavHeading>Content Management System</SideNavHeading>
                            {navigation.cms.map((group, index) => {
                              // store the group items that are not hidden
                              const enabledGroupItems = group.items.filter((item) => item.isHidden !== true);

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
                        </Switch>
                      </SidenavSub>
                    </SideNavs>
                  </SideNavWrapper>
                  <Content theme={theme}>
                    <Switch>
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
                      <Route path={`/cms`}>CMS</Route>
                      <Route path={`/plans/org/:id`}>
                        <PlansPage />
                      </Route>
                      <Route path={`/profile/:profile_id`}>
                        <ProfilePage />
                      </Route>
                      <Route path={`/teams/:team_id`} exact>
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
                    </Switch>
                  </Content>
                </Wrapper>
              </PageWrapper>
            </Route>
          </Switch>
        </Router>
      </CristataWebSocket>
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
