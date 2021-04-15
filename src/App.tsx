import { ArticlesPage } from './pages/ArticlesPage/index';
import { PlansPage } from './pages/plans/PlansPage/PlansPage';
import { theme } from './utils/theme';
import './App.css';
import styled from '@emotion/styled';
import axios from 'axios';
import { configure } from 'axios-hooks';
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
  return (
    <>
      <CristataWebSocket>
        <ToastContainer />
        <Router>
          <Grid>
            <div style={{ gridArea: 'header', background: theme.color.primary[800] }}></div>
            <div style={{ gridArea: 'sidenav-header', background: 'purple' }}></div>
            <div
              style={{
                gridArea: 'sidenav-main',
                background: 'white',
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
                background: 'white',
                borderRight: `1px solid ${
                  theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]
                }`,
              }}
            >
              <Switch>
                <Route path={`/cms`}>
                  <SideNavSubButton Icon={<DocumentAdd24Regular />} to={`/cms/articles/in-progress`}>
                    In-progress articles
                  </SideNavSubButton>
                  <SideNavSubButton Icon={<DocumentOnePage24Regular />} to={`/cms/articles/all`}>
                    All articles
                  </SideNavSubButton>
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
              </Switch>
            </div>
            <div style={{ gridArea: 'content', overflow: 'auto' }}>
              <Switch>
                <Route path={`/cms/articles/:progress`}>
                  <ArticlesPage />
                </Route>
                <Route path={`/cms`}>CMS</Route>
                <Route path={`/chat`}>chat</Route>
                <Route path={`/plans/org/:id`}>
                  <PlansPage />
                </Route>
                <Route path={`/profile`}>profile</Route>
                <Route path={`/`}>
                  <p>Home page</p>
                </Route>
              </Switch>
            </div>
          </Grid>
        </Router>
      </CristataWebSocket>
    </>
  );
}

export default App;
