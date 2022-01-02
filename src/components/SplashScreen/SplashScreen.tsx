import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { themeType } from '../../utils/theme/theme';

interface ISplashScreen {
  loading: boolean; // loading status of api request for user
  error?: AxiosError<any>; // error for api request
  user: any; // the user from the api request
}

/**
 * Displays a splash screen over the content until the app knows the user is authenticated.
 *
 * Also contains the logic for redirecting the user to or from the sign in page route.
 */
function SplashScreen(props: ISplashScreen) {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  // redirect the user to sign in page if not authenticated
  useEffect(() => {
    // store where the user should be redirected
    localStorage.setItem(
      'auth.redirect_after',
      `${window.location.pathname}${window.location.hash}${window.location.search}`
    );
    if (props.error) {
      const is403 = props.error.message.indexOf('403') !== -1;
      // if the error is a 403 (not authenticated), redirect to sign in page
      if (is403) {
        history.push(`/sign-in`);
      }
    }
  }, [props.error, history]);

  // set the user to localstorage if the user is authenticated and requires no
  // other login steps
  useEffect(() => {
    if (props.user && !props.user.next_step) {
      localStorage.setItem('auth.user', JSON.stringify(props.user)); // set user
      const redirect = localStorage.getItem('auth.redirect_after') || '/';
      history.push(redirect !== '/sign-in' ? redirect : '/'); // redirect
      localStorage.removeItem('auth.redirect_after'); // remove redirect url from localstorage
    }
  }, [props.user, history]);

  // if the user is not a member, set it to localstorage but redirect to page to help them become members
  useEffect(() => {
    if (props.user && props.user.next_step === 'join_gh_org') {
      localStorage.setItem('auth.user', JSON.stringify(props.user)); // set user
      history.push('/sign-in-legacy?isMember=false'); // redirect
    }
  }, [props.user, history]);

  // set the session id
  useEffect(() => {
    const sessionIdIsSet = !!sessionStorage.getItem('sessionId');
    if (!sessionIdIsSet) {
      sessionStorage.setItem('sessionId', Math.random().toString());
    }
  });

  // whether the user is on a cms page where the editor is maximized to fill the entire page
  // (we need to set the background color to blue instead of primary)
  const isFullEditorPage =
    location.pathname.indexOf(`/cms/item/`) === 0 && new URLSearchParams(location.search).get('fs') === '1';

  return (
    <div className={`splash-wrapper`}>
      <style>
        {`
          .splash-wrapper {
            inset: 0;
            position: fixed;
            z-index: 9999;
            background: ${isFullEditorPage ? theme.color.blue[800] : theme.color.primary[800]};
            display: flex;
            align-items: center;
            justify-content: center;
            animation: ${
              (!props.error && !props.loading) || (props.error && props.error.message.indexOf('403') !== -1)
                ? `splash-off 0.14s ease-in-out`
                : 'none'
            };
            animation-fill-mode: forwards;
            animation-delay: 0.14s;
          }
          .splash-app-name {
            font-family: ${theme.font.headline};
            font-size: 48px;
            font-weight: 600;
            color: rgb(250, 249, 248);
            text-shadow: rgb(210 208 206 / 60%) 0px 0px 8px, rgb(11 4 36 / 60%) 0px 0px 4px;
            letter-spacing: 2px;
          }
          @keyframes splash-off {
            0%   { opacity: 1; }
            100% { opacity: 0; visibility: hidden; }
          }
      `}
      </style>
      <span className={`splash-app-name`}>Cristata</span>
      {props.error ? (
        <ErrorBlock theme={theme}>Failed to connect to the server.</ErrorBlock>
      ) : (
        <ErrorBlock theme={theme}>
          <Spinner size={32} color={'neutral'} />
        </ErrorBlock>
      )}
    </div>
  );
}

const ErrorBlock = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  bottom: 100px;
`;

export { SplashScreen };
