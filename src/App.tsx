import { ArticlesPage } from './pages/ArticlesPage/index';
import { PlansPage } from './pages/plans/PlansPage/PlansPage';
import { theme } from './utils/theme';
import './App.css';
import styled from '@emotion/styled';
import axios from 'axios';
import useAxios, { configure } from 'axios-hooks';
import { SideNavMainButton, SideNavSubButton } from './components/Button';
import { PlansSideNavSub } from './pages/plans/PlansSideNavSub';
import {
  ContentView32Regular,
  Home32Regular,
  Send28Regular,
  Board28Regular,
  Person32Regular,
  ImageSearch24Regular,
  Image24Regular,
  DocumentOnePage24Regular,
  DocumentAdd24Regular,
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

// configure axios global settings
const axiosSettings = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? `https://api.thepaladin.cristata.app/api/v2`
      : `http://localhost:3001/api/v2`,
  withCredentials: true,
});
configure({ axios: axiosSettings });

// configure GitHub Axios

const Grid = styled.div`
  display: grid;
  grid-template-columns: 80px 300px 1fr;
  grid-template-rows: 0px 40px 1fr;
  grid-template-areas:
    'header         header         header'
    'sidenav-header sidenav-header content'
    'sidenav-main   sidenav-sub    content';
  height: 100%;
`;

function App() {
  const [{ data: user, loading: loadingUser, error: errorUser }] = useAxios({
    url: '/auth',
    baseURL:
      process.env.NODE_ENV === 'production' ? `https://api.thepaladin.cristata.app` : `http://localhost:3001`,
    withCredentials: true,
    method: 'GET',
  });

  return (
    <>
      <CristataWebSocket>
        <ToastContainer />
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
                window.location.href =
                  process.env.NODE_ENV === 'production'
                    ? `https://api.thepaladin.cristata.app/auth/clear`
                    : `http://localhost:3001/auth/clear`;
                return null;
              }}
            />
            <Route>
              <Grid>
                <div style={{ gridArea: 'header', background: theme.color.primary[800] }}></div>
                <div
                  style={{
                    gridArea: 'sidenav-header',
                    borderRight: `1px solid ${
                      theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]
                    }`,
                    borderBottom: `1px solid ${
                      theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]
                    }`,
                  }}
                >
                  <SidenavHeader />
                </div>
                <div
                  style={{
                    gridArea: 'sidenav-main',
                    background: theme.mode === 'light' ? 'white' : 'black',
                    borderRight: `1px solid ${
                      theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]
                    }`,
                  }}
                >
                  <SideNavMainButton Icon={<Home32Regular />} to={`/`}>
                    Home
                  </SideNavMainButton>
                  <SideNavMainButton Icon={<ContentView32Regular />} to={`/cms/articles/in-progress`}>
                    CMS
                  </SideNavMainButton>
                  <SideNavMainButton Icon={<Send28Regular />} to={`/chat`}>
                    Messages
                  </SideNavMainButton>
                  <SideNavMainButton Icon={<Board28Regular />} to={`/plans`}>
                    Plans
                  </SideNavMainButton>
                  <SideNavMainButton Icon={<Person32Regular />} to={`/profile`}>
                    Profile
                  </SideNavMainButton>
                </div>
                <div
                  style={{
                    gridArea: 'sidenav-sub',
                    background: theme.mode === 'light' ? 'white' : 'black',
                    borderRight: `1px solid ${
                      theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]
                    }`,
                  }}
                >
                  <Switch>
                    <Route path={`/cms`}>
                      <SideNavHeading>Articles</SideNavHeading>
                      <SideNavSubButton Icon={<DocumentAdd24Regular />} to={`/cms/articles/in-progress`}>
                        In-progress articles
                      </SideNavSubButton>
                      <SideNavSubButton Icon={<DocumentOnePage24Regular />} to={`/cms/articles/all`}>
                        All articles
                      </SideNavSubButton>
                      <SideNavHeading>Photos</SideNavHeading>
                      <SideNavSubButton Icon={<ImageSearch24Regular />} to={`/cms/photos/requests`}>
                        Photo requests
                      </SideNavSubButton>
                      <SideNavSubButton Icon={<Image24Regular />} to={`/cms/photos/library`}>
                        Photo library
                      </SideNavSubButton>
                    </Route>
                    <Route path={`/plans`}>
                      <PlansSideNavSub />
                    </Route>
                    <Route path={`/chat`}>
                      <ChatSideNavSub />
                    </Route>
                    <Route path={`/profile`}>
                      <ProfileSideNavSub />
                    </Route>
                  </Switch>
                </div>
                <div
                  style={{
                    gridArea: 'content',
                    overflow: 'auto',
                    background: theme.mode === 'light' ? 'white' : 'black',
                  }}
                >
                  <Switch>
                    <Route path={`/cms/articles/:progress`}>
                      <ArticlesPage />
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
                      <p>Home page</p>
                    </Route>
                  </Switch>
                </div>
              </Grid>
            </Route>
          </Switch>
        </Router>
      </CristataWebSocket>
    </>
  );
}

export default App;
