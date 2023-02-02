import { browser } from '$app/environment';
import { ApolloProvider } from '@apollo/client';
import { ModalProvider } from '@cristata/react-modal-hook';
import { css, Global, ThemeProvider } from '@emotion/react';
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
import { theme as themeC } from './utils/theme/theme';

export interface IGridCols {
  side: number;
  sideSub: number;
}

function App({ children }: { children?: React.ReactNode }) {
  const tenant = (browser && location.pathname.split('/')[1]) || '';
  const client = useMemo(() => createClient(tenant), [tenant]);

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    browser && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const theme = useMemo(() => themeC(themeMode), [themeMode]);

  // listen for when user changes system theme preference
  useEffect(() => {
    const setCorrectThemeMode = (e: MediaQueryListEvent) => {
      if (e.matches) setThemeMode('dark');
      else setThemeMode('light');
    };

    if (browser)
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setCorrectThemeMode);

    return () => {
      if (browser) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setCorrectThemeMode);
      }
    };
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

  if (browser) {
    return (
      <ApolloProvider client={client}>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider theme={theme}>
              <DropdownProvider>
                <Router>
                  <ModalProvider>
                    <ToastContainer />
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

  return <div>SRR unavailable</div>;
}

export default App;
