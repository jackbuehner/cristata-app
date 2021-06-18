import { useTheme } from '@emotion/react';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { themeType } from '../../utils/theme/theme';

interface ISplashScreen {
  loading: boolean;
  error: AxiosError<any> | undefined;
  user: any;
}

function SplashScreen(props: ISplashScreen) {
  const theme = useTheme() as themeType;
  const history = useHistory();

  useEffect(() => {
    localStorage.setItem(
      'auth.redirect_after',
      `${window.location.pathname}${window.location.hash}${window.location.search}`
    );
    if (props.error) {
      const is403 = props.error.message.indexOf('403') !== -1;
      if (is403) {
        history.push(`/sign-in`);
      }
    }
  }, [props.error, history]);

  useEffect(() => {
    if (props.user) {
      localStorage.setItem('auth.user', JSON.stringify(props.user));
      history.push(localStorage.getItem('auth.redirect_after') || '/');
      localStorage.removeItem('auth.redirect_after');
    }
  }, [props.user, history]);

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
