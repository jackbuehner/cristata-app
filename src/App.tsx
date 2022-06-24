import { ApolloProvider } from '@apollo/client';
import LuxonUtils from '@date-io/luxon';
import { css, Global, ThemeProvider } from '@emotion/react';
import loadable from '@loadable/component';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import useAxios, { configure } from 'axios-hooks';
import { useEffect, useMemo, useState } from 'react';
import { ModalProvider } from 'react-modal-hook';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ToastContainer } from './components/ToastContainer';
import { createClient } from './graphql/client';
import { DropdownProvider } from './hooks/useDropdown';
import { PickTenant } from './pages/PickTenant';
import { ProtocolHandlerPage } from './pages/ProtocolHandlerPage';
import { SignIn, SignOut } from './pages/SignIn';
import { store } from './redux/store';
import { db } from './utils/axios/db';
import { server } from './utils/constants';
import { theme as themeC } from './utils/theme/theme';

/* prettier-ignore */ const Protected = loadable(() => import(/* webpackChunkName: "ProtectedRoutes" */'./Protected'), { resolveComponent: ({ Protected }) => Protected });
/* prettier-ignore */ const SplashScreen = loadable(() => import(/* webpackChunkName: "SplashScreen" */'./components/SplashScreen'), { resolveComponent: ({ SplashScreen }) => SplashScreen });

Protected.preload();
SplashScreen.preload();

// configure axios global settings
configure({ axios: db });

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App() {
  const [{ data: user, loading: loadingUser, error: errorUser }] = useAxios({
    url: '/auth',
    baseURL: server.location,
    withCredentials: true,
    method: 'GET',
  });

  const [tenant, setTenant] = useState<string>(localStorage.getItem('tenant') || '');
  const client = useMemo(() => createClient(tenant), [tenant]);

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const theme = useMemo(() => themeC(themeMode), [themeMode]);

  // listen for when user changes system theme preference
  useEffect(() => {
    const setCorrectThemeMode = (e: MediaQueryListEvent) => {
      if (e.matches) setThemeMode('dark');
      else setThemeMode('light');
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setCorrectThemeMode);

    return () =>
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setCorrectThemeMode);
  });

  // redirect to tenant if the current url is missing the tenant
  useEffect(() => {
    if (!window.location.pathname.includes(tenant)) {
      const url = new URL(window.location.href);
      url.pathname = tenant + url.pathname;
      window.history.replaceState(null, '', url);
      window.location.reload();
    }
  }, [tenant]);

  return (
    <ApolloProvider client={client}>
      <ReduxProvider store={store}>
        <ThemeProvider theme={theme}>
          <ModalProvider>
            <DropdownProvider>
              <MuiPickersUtilsProvider utils={LuxonUtils}>
                <Router basename={tenant}>
                  <ToastContainer />
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
                    protectedChildren={<Protected setThemeMode={setThemeMode} />}
                  >
                    {tenant === '' || !window.location.pathname.includes(tenant) ? (
                      <PickTenant tenant={tenant} setTenant={setTenant} />
                    ) : null}
                  </SplashScreen>
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
              </MuiPickersUtilsProvider>
            </DropdownProvider>
          </ModalProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ApolloProvider>
  );
}

export default App;
