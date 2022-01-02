import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { themeType } from '../../utils/theme/theme';
import { Spinner } from '../Loading';

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
            flex-direction: column;
            gap: 20px;
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
          .splash-app-logo {
            fill: rgb(250, 249, 248);
            height: 100px;
            width: auto;
            filter: drop-shadow(rgb(210 208 206 / 60%) 0px 0px 8px)
              drop-shadow(rgb(11 4 36 / 60%) 0px 0px 4px);
          }
          @keyframes splash-off {
            0%   { opacity: 1; }
            100% { opacity: 0; visibility: hidden; }
          }
      `}
      </style>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='41.57'
        height='48'
        viewBox='0 0 31.1775 36'
        className='splash-app-logo'
      >
        <path d='m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z' />
        <path d='M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z' />
      </svg>
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
