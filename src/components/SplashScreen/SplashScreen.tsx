import { useTheme } from '@emotion/react';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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

  // set the user to localstorage if the user is authenticated and is a member
  useEffect(() => {
    if (props.user && props.user.member_status) {
      localStorage.setItem('auth.user', JSON.stringify(props.user)); // set user
      const redirect = localStorage.getItem('auth.redirect_after') || '/';
      history.push(redirect !== '/sign-in' ? redirect : '/'); // redirect
      localStorage.removeItem('auth.redirect_after'); // remove redirect url from localstorage
    }
  }, [props.user, history]);

  // set the session id
  useEffect(() => {
    const sessionIdIsSet = !!sessionStorage.getItem('sessionId');
    if (!sessionIdIsSet) {
      sessionStorage.setItem('sessionId', Math.random().toString());
    }
  });

  return (
    <div className={`splash-wrapper`}>
      <style>
        {`
          .splash-wrapper {
            inset: 0;
            position: fixed;
            z-index: 9999;
            background: ${theme.color.primary[800]};
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
    </div>
  );
}

export { SplashScreen };
