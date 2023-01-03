import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Color from 'color';
import React from 'react';
import ReactDOM from 'react-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactTooltip from 'react-tooltip';
import { serializeError } from 'serialize-error';
import now from '~build/time';
import App from './App';
import './init';
import reportWebVitals from './reportWebVitals';
import { theme } from './utils/theme';

const queryClient = new QueryClient();

const appTheme = theme(window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const Tooltip = styled(ReactTooltip)`
  margin: 0 !important;
  font-size: 12px !important;
  font-family: 'Segoe UI', -apple-system, sans-serif !important;
  padding: 8px !important;
  line-height: 12px !important;
  border: none !important;
  box-shadow: 0 0 0 1px inset ${Color(appTheme.color.neutral[appTheme.mode][600]).alpha(0.3).string()},
    0.3px 0.3px 2.2px rgba(0, 0, 0, 0.034), 0.7px 0.7px 5.3px rgba(0, 0, 0, 0.048),
    1.3px 1.3px 10px rgba(0, 0, 0, 0.06), 2.2px 2.2px 17.9px rgba(0, 0, 0, 0.072),
    4.2px 4.2px 33.4px rgba(0, 0, 0, 0.086), 10px 10px 80px rgba(0, 0, 0, 0.12) !important;
  color: ${appTheme.color.neutral[appTheme.mode][1400]} !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background-blend-mode: exclusion;
  background-color: ${appTheme.mode === 'light'
    ? Color(appTheme.color.neutral.light[100]).alpha(0.8).string()
    : Color(appTheme.color.neutral.dark[300]).alpha(0.8).string()} !important;
  background-image: url(data:image/png;base64,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);

  &.show {
    opacity: 1 !important;
  }
  &::before,
  &::after {
    content: unset !important;
  }
`;

function AppErrorFallback({ error: unserializedError, resetErrorBoundary }: FallbackProps) {
  const error = serializeError(unserializedError);
  return (
    <div
      role='alert'
      style={{
        padding: 20,
        height: '100%',
        backgroundColor: '#5438B9',
        color: '#e0e0e0',
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      }}
    >
      <style>
        {`
          .root-splash-wrapper {
            display: none !important;
          }
        `}
      </style>
      <div
        style={{
          float: 'right',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 84,
          width: 'fit-content',
        }}
      >
        <button onClick={resetErrorBoundary} className={`error-button`}>
          Try again
        </button>
        <button
          onClick={() => {
            window.localStorage.clear();
            window.sessionStorage.clear();
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let registration of registrations) {
                  registration.unregister();
                }
              });
            }
            const tenant = window.location.pathname.split('/')[1];
            window.location.href = `${import.meta.env.VITE_API_PROTOCOL}//${
              import.meta.env.VITE_AUTH_BASE_URL
            }/${tenant || ''}/sign-out?return=${encodeURIComponent(window.location.origin + '/' + tenant)}`;
          }}
          className={`error-button`}
        >
          Reset app
        </button>
        <button
          onClick={() => {
            // eslint-disable-next-line no-self-assign
            if (document && document.location) document.location = document.location;
          }}
          className={`error-button`}
        >
          Refresh
        </button>
      </div>
      <p style={{ fontSize: 120, margin: '20px 0 -10px 0', fontWeight: 300 }}>:(</p>
      <p style={{ fontSize: 28, margin: '20px 0' }}>Something went wrong</p>
      <p style={{ fontSize: 22, margin: '20px 0', whiteSpace: 'pre-wrap' }}>{error.message}</p>
      <p style={{ fontSize: 22, margin: '20px 0', whiteSpace: 'pre-wrap' }}>Build date: {now.toISOString()}</p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <CacheProvider
      value={createCache({
        key: 'cristata',
      })}
    >
      <ErrorBoundary FallbackComponent={AppErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <App />
          <Tooltip
            place={'bottom'}
            effect={'float'}
            delayShow={600}
            delayHide={100}
            theme={theme(window?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')}
            overridePosition={(pos, currentEvent, currentTarget, refNode, place, desiredPlace, effect) => {
              if (place === desiredPlace && effect === 'float')
                return {
                  top: pos.top + 2,
                  left: pos.left + (refNode?.offsetWidth || 0) / 2 + 8,
                };
              return pos;
            }}
          />
        </QueryClientProvider>
      </ErrorBoundary>
    </CacheProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
