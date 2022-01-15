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
  persistentChildren?: React.ReactNode;
  protectedChildren?: React.ReactNode;
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

  useEffect(() => {
    if (props.user) {
      localStorage.setItem('auth.user', JSON.stringify(props.user)); // set user

      // user needs to change password
      if (props.user.next_step === 'change_password') {
        history.push('/sign-in', { username: props.user.email, step: 'change_password' });
      }
      // user needs to create a password
      else if (!props.user.methods.includes('local')) {
        history.push('/sign-in', { step: 'migrate_to_local' });
      }
      // users needs to join gh org
      else if (props.user.next_step === 'join_gh_org') {
        history.push('/sign-in-legacy?isMember=false');
      }
      // redirect to user's desired page if there are not other login steps
      else if (!props.user.next_step) {
        const redirect = localStorage.getItem('auth.redirect_after') || '/';
        history.push(!redirect.includes('/sign-in') ? redirect : '/'); // redirect
        localStorage.removeItem('auth.redirect_after'); // remove redirect url from localstorage
      }
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
    <>
      <div className={`splash-wrapper`}>
        <style>
          {`
          .splash-wrapper {
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
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
            -webkit-app-region: drag;
          }
          .splash-app-name {
            height: 40px;
            margin: 8px;
            color: rgb(250, 249, 248);
            filter: drop-shadow(rgb(210 208 206 / 60%) 0px 0px 8px)
              drop-shadow(rgb(11 4 36 / 60%) 0px 0px 4px);
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
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='270px'
          height='50px'
          viewBox='0 0 270 50'
          version='1.1'
          className='splash-app-name'
        >
          <path
            d='M264.76 26.048C264.76 17.344 258.296 14.528 250.424 14.528C246.008 14.528 240.696 15.744 236.216 17.28L236.216 25.6C237.432 25.856 238.648 25.856 239.864 25.6L241.784 19.712C243.832 19.328 245.56 19.2 247.48 19.2C251.32 19.2 255.032 20.288 255.032 25.28L255.032 28.352C245.816 28.48 233.976 29.248 233.976 39.808C233.976 46.464 238.52 49.728 244.472 49.728C248.504 49.728 252.28 48.128 254.776 44.928L255.032 44.928L255.032 45.184C255.032 48.832 257.144 49.728 259.512 49.728C260.152 49.728 260.984 49.664 261.688 49.536L269.304 48.256C269.56 47.168 269.56 46.144 269.304 45.056L264.76 45.056L264.76 26.048ZM258.032 40.512C256.496 42.56 253.424 44.224 250.928 44.224C248.688 44.224 246.832 42.88 246.832 39.36C246.832 32.96 253.552 32.192 258.032 32.128L258.032 40.512ZM211.408 15.552L206.864 17.024C206.672 17.792 206.672 18.624 206.864 19.392L211.408 19.392L211.408 37.184C211.408 46.4 215.76 49.728 223.888 49.728C225.68 49.728 227.856 49.536 229.52 49.152C229.648 48.512 229.712 47.872 229.712 47.232C229.712 46.592 229.648 45.952 229.52 45.312C221.712 45.952 221.136 41.536 221.136 35.2L221.136 19.392L229.52 19.392C229.648 18.752 229.712 18.048 229.712 17.408C229.712 16.768 229.648 16.192 229.52 15.552L221.136 15.552L221.136 5.18399L220.56 4.672L211.408 6.39999L211.408 15.552ZM200.12 26.048C200.12 17.344 193.656 14.528 185.784 14.528C181.368 14.528 176.056 15.744 171.576 17.28L171.576 25.6C172.792 25.856 174.008 25.856 175.224 25.6L177.144 19.712C179.192 19.328 180.92 19.2 182.84 19.2C186.68 19.2 190.392 20.288 190.392 25.28L190.392 28.352C181.176 28.48 169.336 29.248 169.336 39.808C169.336 46.464 173.88 49.728 179.832 49.728C183.864 49.728 187.64 48.128 190.136 44.928L190.392 44.928L190.392 45.184C190.392 48.832 192.504 49.728 194.872 49.728C195.512 49.728 196.344 49.664 197.048 49.536L204.664 48.256C204.92 47.168 204.92 46.144 204.664 45.056L200.12 45.056L200.12 26.048ZM189.392 40.512C187.856 42.56 184.784 44.224 182.288 44.224C180.048 44.224 178.192 42.88 178.192 39.36C178.192 32.96 184.912 32.192 189.392 32.128L189.392 40.512ZM144.768 15.552L140.224 17.024C140.032 17.792 140.032 18.624 140.224 19.392L144.768 19.392L144.768 37.184C144.768 46.4 149.12 49.728 157.248 49.728C159.04 49.728 161.216 49.536 162.88 49.152C163.008 48.512 163.072 47.872 163.072 47.232C163.072 46.592 163.008 45.952 162.88 45.312C155.072 45.952 154.496 41.536 154.496 35.2L154.496 19.392L162.88 19.392C163.008 18.752 163.072 18.048 163.072 17.408C163.072 16.768 163.008 16.192 162.88 15.552L154.496 15.552L154.496 5.18399L153.92 4.672L144.768 6.39999L144.768 15.552ZM132.592 17.088C129.2 15.488 125.04 14.528 121.008 14.528C114.48 14.528 106.48 17.088 106.48 25.024C106.48 38.4 125.488 34.176 125.488 40.448C125.488 44.096 121.264 45.248 117.296 45.248C115.312 45.248 113.392 44.928 112.048 44.544L110.128 38.336C108.976 38.08 107.76 38.08 106.48 38.336L106.48 46.784C109.488 48.64 113.904 49.728 118.384 49.728C126.32 49.728 134.32 46.336 134.32 38.208C134.32 25.6 115.248 30.016 115.248 23.232C115.248 19.776 119.28 19.008 122.416 19.008C124.144 19.008 125.744 19.2 127.152 19.456L128.944 24.896C130.16 25.152 131.376 25.152 132.592 24.896L132.592 17.088ZM94.624 18.88C94.624 15.808 93.728 14.528 91.168 14.528C90.464 14.528 89.696 14.592 88.736 14.784L80.352 16.32C80.16 17.408 80.16 18.432 80.352 19.52L84.896 19.52L84.896 45.248L80.352 46.528C80.16 47.36 80.16 48.256 80.352 49.088L99.168 49.088C99.36 48.192 99.36 47.296 99.168 46.528L94.624 45.248L94.624 18.88ZM84.896 0.447998C84.576 1.92001 84.448 3.328 84.448 4.73599C84.448 6.14401 84.576 7.616 84.896 9.02399C86.368 9.28 87.84 9.40799 89.248 9.40799C90.656 9.40799 92.064 9.28 93.472 9.02399C93.728 7.67999 93.92 6.14401 93.92 4.73599C93.92 3.328 93.728 1.85599 93.472 0.447998C92 0.191986 90.528 0 89.12 0C87.712 0 86.304 0.191986 84.896 0.447998L84.896 0.447998ZM70.352 20.736L71.632 24.768C72.784 25.024 74 25.024 75.28 24.768L75.28 14.72C74.192 14.592 73.168 14.528 72.208 14.528C66.512 14.528 63.632 16.704 61.2 19.264L60.944 19.264L60.944 18.88C60.944 15.808 60.048 14.528 57.488 14.528C56.784 14.528 56.016 14.592 55.056 14.784L46.672 16.32C46.48 17.408 46.48 18.432 46.672 19.52L51.216 19.52L51.216 45.248L46.672 46.528C46.48 47.36 46.48 48.256 46.672 49.088L65.488 49.088C65.68 48.192 65.68 47.296 65.488 46.528L60.944 45.248L60.944 23.552C62.224 22.272 64.784 20.544 68.304 20.544C68.944 20.544 69.648 20.608 70.352 20.736L70.352 20.736ZM32 43.648C30.208 44.352 28.096 44.672 25.92 44.672C14.784 44.672 10.24 37.376 10.24 26.048C10.24 15.296 14.528 7.168 25.92 7.168C28.032 7.168 30.08 7.552 31.872 8.384L34.816 15.872C35.456 16 36.096 16.064 36.736 16.064C37.376 16.064 38.016 16 38.656 15.872L38.656 5.888C34.752 3.58401 29.632 2.36801 24.576 2.36801C10.56 2.36801 0 10.752 0 26.048C0 41.536 9.28 49.728 22.72 49.728C28.544 49.728 34.496 48.192 38.976 45.504L38.976 35.136C38.336 35.008 37.696 34.944 37.056 34.944C36.416 34.944 35.776 35.008 35.136 35.136L32 43.648Z'
            id='Cristata'
            fill='currentColor'
            stroke='none'
          />
        </svg>
        {props.error ? (
          <ErrorBlock theme={theme}>Failed to connect to the server.</ErrorBlock>
        ) : (
          <ErrorBlock theme={theme}>
            <Spinner size={32} color={'neutral'} />
          </ErrorBlock>
        )}
      </div>
      {props.loading || !props.user || props.error ? (
        props.persistentChildren
      ) : (
        <>
          {props.persistentChildren}
          {props.protectedChildren}
        </>
      )}
    </>
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
