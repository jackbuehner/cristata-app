import { css, Global, ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled/macro';
import * as fluentIcons from '@fluentui/react-icons';
import useAxios, { configure } from 'axios-hooks';
import Color from 'color';
import { Fragment, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { SideNavSubButton } from './components/Button';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import { SideNavHeading } from './components/Heading';
import { PageHead } from './components/PageHead';
import { Sidenav } from './components/Sidenav/Sidenav';
import { SidenavHeader } from './components/SidenavHeader';
import { SidenavSub } from './components/SidenavSub';
import { SplashScreen } from './components/SplashScreen';
import { Titlebar } from './components/Titlebar';
import { ToastContainer } from './components/ToastContainer';
import { useNavigationConfig } from './hooks/useNavigationConfig';
import { CollectionItemPage } from './pages/CMS/CollectionItemPage';
import { CollectionPage } from './pages/CMS/CollectionPage';
import { PhotoLibraryPage } from './pages/CMS/PhotoLibraryPage';
import { FathomEmbed } from './pages/embeds';
import { HomePage } from './pages/Home';
import { Playground, PlaygroundNavigation } from './pages/playground';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ProfileSideNavSub } from './pages/profile/ProfileSideNavSub';
import { ProtocolHandlerPage } from './pages/ProtocolHandlerPage';
import { SignIn, SignOut } from './pages/SignIn';
import { TeamPage } from './pages/teams/TeamPage';
import { TeamsNav } from './pages/teams/TeamsNav';
import { TeamsOverviewPage } from './pages/teams/TeamsOverviewPage';
import { db } from './utils/axios/db';
import { isFluentIconComponent } from './utils/isFluentIconComponent';
import { theme as themeC, themeType } from './utils/theme/theme';

// configure axios global settings
configure({ axios: db });

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App() {
  const [{ data: user, loading: loadingUser, error: errorUser }] = useAxios({
    url: '/auth',
    baseURL: `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}`,
    withCredentials: true,
    method: 'GET',
  });

  const [theme, setTheme] = useState(
    themeC(window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

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
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <Router basename={process.env.PUBLIC_URL || undefined}>
        <SplashScreen
          loading={loadingUser}
          error={errorUser || undefined}
          user={user}
          persistentChildren={
            <Routes>
              <Route path={`/proto/*`} element={<ProtocolHandlerPage />} />
              <Route path={`/sign-in`} element={<SignIn user={user} loadingUser={loadingUser} />} />
              <Route path={`/sign-out`} element={<SignOut />} />
              <Route path={`*`} element={<></>} />
            </Routes>
          }
          protectedChildren={
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
                            <Route
                              path={`/teams/*`}
                              element={<TeamsNav setIsNavVisibleM={setIsNavVisibleM} />}
                            />
                            <Route path={`/playground`} element={<PlaygroundNavigation />} />
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
                      <Route path={`/playground`} element={<Playground setTheme={setTheme} />} />
                      <Route path={`/embed/fathom`} element={<FathomEmbed />} />
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
      <Global
        styles={css`
          .ReactModal__Overlay {
            opacity: 0;
            transition: opacity 240ms;
          }

          .ReactModal__Overlay--after-open {
            opacity: 1;
          }

          .ReactModal__Content {
            opacity: 0;
            transform: translateY(-40px) scale(0.9);
            transition: transform 240ms, opacity 240ms;
          }

          .ReactModal__Content--after-open {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        `}
      />
    </ThemeProvider>
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

export default App;
