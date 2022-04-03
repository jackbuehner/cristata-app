/** @jsxImportSource @emotion/react */
import { css, SerializedStyles, useTheme } from '@emotion/react';
import Color from 'color';
import { ReactText } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Button } from '.';
import { themeType } from '../../utils/theme/theme';

function SideNavMainButton(props: {
  children: ReactText;
  Icon: JSX.Element;
  to?: string;
  onClick?: () => void;
  cssExtra?: SerializedStyles;
}) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const location = useLocation();

  const isActive =
    (props.to && location.pathname.indexOf(props.to) !== -1 && props.to !== '/') ||
    (location.pathname === '/' && props.to === '/');

  return (
    <Button
      height={67}
      width={67}
      cssExtra={css`
        flex-direction: column;
        font-weight: 500;
        color: ${isActive ? theme.color.primary[theme.mode === 'light' ? 900 : 300] : ''};
        background: ${isActive ? Color(theme.color.neutral[theme.mode][800]).alpha(0.12).string() : 'unset'};
        margin: 6px 6px 0 6px;
        @media (max-width: 600px) {
          height: 55px;
          width: unset;
          min-width: 70px;
          max-width: 168px;
          border-bottom-color: transparent;
          background: none;
          flex-grow: 1;
          flex-basis: 0;
          margin: 0;
        }
        ${props.cssExtra}
      `}
      colorShade={theme.mode === 'light' ? 600 : 300}
      backgroundColor={{ base: 'white' }}
      border={{ base: '1px solid transparent' }}
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
        if (props.to) {
          navigate(props.to);
        }
      }}
      customIcon={
        <span
          css={css`
            svg {
              width: 24px;
              height: 24px;
              fill: ${isActive
                ? theme.color.primary[theme.mode === 'light' ? 900 : 300]
                : theme.color.neutral[theme.mode][1400]};
            }
          `}
        >
          {props.Icon}
        </span>
      }
      disableLabelAlignmentFix
    >
      {props.children}
    </Button>
  );
}

export { SideNavMainButton };
