import { ApolloProvider } from '@apollo/client';
import { ModalProvider } from '@cristata/react-modal-hook';
import { css, Global, ThemeProvider } from '@emotion/react';
import loadable from '@loadable/component';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from 'redux-persist/integration/react';
import './App.css';
import { ToastContainer } from './components/ToastContainer';
import { createClient } from './graphql/client';
import { DropdownProvider } from './hooks/useDropdown';
import { persistor, store } from './redux/store';
import { ReloadPrompt } from './ReloadPrompt';
import { server } from './utils/constants';
import { theme as themeC } from './utils/theme/theme';

// /* prettier-ignore */ const Protected = loadable(() => import(/* webpackChunkName: "ProtectedRoutes" */'./Protected'), { resolveComponent: ({ Protected }) => Protected });
/* prettier-ignore */ const SplashScreen = loadable(() => import(/* webpackChunkName: "SplashScreen" */'./components/SplashScreen'), { resolveComponent: ({ SplashScreen }) => SplashScreen });

// Protected.preload();
SplashScreen.preload();

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App({ children }: { children?: React.ReactNode }) {
  const {
    data: user,
    isLoading: loadingUser,
    error: errorUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['authUserData'],
    cacheTime: 0,
    queryFn: () =>
      fetch(`${server.location}/auth`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => {
        if (res.status === 401) throw new Error('401');
        if (res.status === 403) throw new Error('403');
        return res.json();
      }),
  });

  const [tenant, setTenant] = useState<string>(location.pathname.split('/')[1] || '');
  const client = useMemo(() => createClient(tenant), [tenant]);

  // refetch the user if reauth=1 in url
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('from') === 'sign-out') {
      searchParams.delete('from');
      refetchUser();
      window.history.replaceState(undefined, '', '?' + searchParams.toString());
    }
  }, [refetchUser]);

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

  // suppress warnings that we do not care about
  const consoleError = console.error;
  console.error = function filterWarnings(msg: unknown | undefined) {
    const supressedWarnings = [
      'prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase',
      '`label` of `value` is not same as `label` in Select options.',
    ];

    if (msg && typeof msg === 'string' && !supressedWarnings.some((entry) => msg.includes(entry))) {
      consoleError.apply(console, arguments as unknown as any[]);
    }
  };

  return (
    <ApolloProvider client={client}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <DropdownProvider>
              <Router>
                <ModalProvider>
                  <ToastContainer />
                  <ReloadPrompt />
                  {/* <SplashScreen
                    loading={loadingUser}
                    error={errorUser || undefined}
                    user={user}
                    bypassAuthLogic={!navigator.onLine}
                    persistentChildren={
                      <Routes>
                        <Route path={`/${tenant}/proto/*`} element={<ProtocolHandlerPage />} />
                        <Route path={`/${tenant}/sign-out`} element={<SignOut />} />
                        <Route path={`*`} element={<></>} />
                      </Routes>
                    }
                    protectedChildren={<Protected setThemeMode={setThemeMode} />}
                  /> */}
                  {children}
                </ModalProvider>
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
            </DropdownProvider>
          </ThemeProvider>
        </PersistGate>
      </ReduxProvider>
    </ApolloProvider>
  );
}

export default App;
