import { ArticlesPage } from './pages/ArticlesPage/index';
import { PlansPage } from './pages/plans/PlansPage/PlansPage';
import { theme } from './utils/theme';
import './App.css';
import styled from '@emotion/styled';
import axios from 'axios';
import useAxios, { configure } from 'axios-hooks';
import { SideNavSubButton } from './components/Button';
import { PlansSideNavSub } from './pages/plans/PlansSideNavSub';
import {
  ImageSearch24Regular,
  Image24Regular,
  DocumentOnePage24Regular,
  Sport24Regular,
  News24Regular,
  PaintBrush24Regular,
  Star24Regular,
  Chat24Regular,
  DocumentPageBottomRight24Regular,
  Balloon16Regular,
  Dismiss16Regular,
  Cookies24Regular,
  StarEmphasis24Regular,
} from '@fluentui/react-icons';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CristataWebSocket } from './components/CristataWebSocket/CristataWebSocket';
import { ChatSideNavSub } from './pages/Chat/ChatSideNavSub';
import { ChatPage } from './pages/Chat/ChatPage';
import { ItemDetailsPage } from './pages/CMS/ItemDetailsPage';
import { SplashScreen } from './components/SplashScreen';
import { SignIn } from './pages/SignIn';
import { ProfileSideNavSub } from './pages/profile/ProfileSideNavSub';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SideNavHeading } from './components/Heading';
import { SidenavHeader } from './components/SidenavHeader';
import { useState } from 'react';
import { PhotoRequestsPage } from './pages/CMS/PhotoRequestsPage';
import { PhotoLibraryPage } from './pages/CMS/PhotoLibraryPage';
import { themeType } from './utils/theme/theme';
import { SidenavSub } from './components/SidenavSub';
import { Sidenav } from './components/Sidenav/Sidenav';
import Color from 'color';
import { HomePage } from './pages/Home';
import { SatirePage } from './pages/CMS/SatirePage';

// configure axios global settings
const axiosSettings = axios.create({
  baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/api/v2`,
  withCredentials: true,
});
configure({ axios: axiosSettings });

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
            <Route path={`/sign-in`} exact>
              <SignIn />
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
              <PageWrapper>
                <SidenavHeader gridCols={gridCols} homeOnly isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]} />
                <Wrapper>
                  <SideNavWrapper gridCols={gridCols} isNavVisibleM={isNavVisibleM}>
                    <SidenavHeader gridCols={gridCols} isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]} />
                    <SideNavs>
                      <Sidenav
                        gridCols={gridCols}
                        toggleSideNavSub={toggleSideNavSub}
                        isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}
                      />
                      <SidenavSub gridCols={gridCols} isNavVisibleM={[isNavVisibleM, setIsNavVisibleM]}>
                        <Switch>
                          <Route path={`/cms`}>
                            <SideNavHeading>Articles</SideNavHeading>
                            <SideNavSubButton
                              Icon={<DocumentPageBottomRight24Regular />}
                              to={`/cms/articles/in-progress`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              In-progress articles
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<DocumentOnePage24Regular />}
                              to={`/cms/articles/all`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              All articles
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<News24Regular />}
                              to={`/cms/articles/in-progress?category=news`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              News articles (in-progress)
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<Chat24Regular />}
                              to={`/cms/articles/in-progress?category=opinion`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Opinions (in-progress)
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<Sport24Regular />}
                              to={`/cms/articles/in-progress?category=sports`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Sports articles (in-progress)
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<Star24Regular />}
                              to={`/cms/articles/in-progress?category=diversity%20matters`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Diversity matters articles (in-progress)
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<PaintBrush24Regular />}
                              to={`/cms/articles/in-progress?category=arts`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Arts articles (in-progress)
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<Balloon16Regular />}
                              to={`/cms/articles/in-progress?category=campus%20%26%20culture`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Campus &amp; culture articles (in-progress)
                            </SideNavSubButton>

                            <SideNavHeading>Photos</SideNavHeading>
                            <SideNavSubButton
                              Icon={<ImageSearch24Regular />}
                              to={`/cms/photos/requests/unfulfilled`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Unfulfilled photo requests
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<ImageSearch24Regular />}
                              to={`/cms/photos/requests/all`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              All photo requests
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<Image24Regular />}
                              to={`/cms/photos/library`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              Photo library
                            </SideNavSubButton>
                            <SideNavHeading>Satire</SideNavHeading>
                            <SideNavSubButton
                              Icon={<DocumentPageBottomRight24Regular />}
                              to={`/cms/satire/in-progress`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              In-progress satire
                            </SideNavSubButton>
                            <SideNavSubButton
                              Icon={<Cookies24Regular />}
                              to={`/cms/satire/all`}
                              setIsNavVisibleM={setIsNavVisibleM}
                            >
                              All satire
                            </SideNavSubButton>
                            {JSON.parse(localStorage.getItem('auth.user') as string)?.teams.includes(
                              'MDQ6VGVhbTQ2NDI0MTc='
                            ) ? (
                              <>
                                <SideNavHeading>Configuration</SideNavHeading>
                                <SideNavSubButton
                                  Icon={<StarEmphasis24Regular />}
                                  to={`/cms/item/featured-settings/6101da4a5386ae9ea3147f17`}
                                  setIsNavVisibleM={setIsNavVisibleM}
                                >
                                  Featured articles
                                </SideNavSubButton>
                              </>
                            ) : null}
                          </Route>
                          <Route path={`/plans`}>
                            <PlansSideNavSub setIsNavVisibleM={setIsNavVisibleM} />
                          </Route>
                          <Route path={`/chat`}>
                            <ChatSideNavSub setIsNavVisibleM={setIsNavVisibleM} />
                          </Route>
                          <Route path={`/profile`}>
                            <ProfileSideNavSub setIsNavVisibleM={setIsNavVisibleM} />
                          </Route>
                        </Switch>
                      </SidenavSub>
                    </SideNavs>
                  </SideNavWrapper>
                  <Content theme={theme}>
                    <Switch>
                      <Route path={`/cms/articles/:progress`}>
                        <ArticlesPage />
                      </Route>
                      <Route path={`/cms/satire/:progress`}>
                        <SatirePage />
                      </Route>
                      <Route path={`/cms/photos/requests/:progress`}>
                        <PhotoRequestsPage />
                      </Route>
                      <Route path={`/cms/photos/library/:photo_id?`}>
                        <PhotoLibraryPage />
                      </Route>
                      <Route path={`/cms/item/:collection/:item_id`}>
                        <ItemDetailsPage />
                      </Route>
                      <Route path={`/cms`}>CMS</Route>
                      <Route path={`/chat/:team_slug/:thread_discussion_number?`}>
                        <ChatPage />
                      </Route>
                      <Route path={`/plans/org/:id`}>
                        <PlansPage />
                      </Route>
                      <Route path={`/profile/:profile_id`}>
                        <ProfilePage />
                      </Route>
                      <Route path={`/`}>
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

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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

const SideNavWrapper = styled.div<{ gridCols: IGridCols; isNavVisibleM: boolean }>`
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
  height: calc(100% - 42px);
`;

const Content = styled.div<{ theme: themeType }>`
  overflow: auto;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  width: 100%;
  height: 100%;
`;

export default App;
