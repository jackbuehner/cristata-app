/** @jsxImportSource @emotion/react */
import { css, SerializedStyles, useTheme } from '@emotion/react';
import Color from 'color';
import { Dispatch, ReactText, SetStateAction } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Button } from '.';
import { themeType } from '../../utils/theme/theme';

function SideNavMainButton(props: {
  children: ReactText;
  Icon: JSX.Element;
  to?: string;
  onClick?: () => void;
  cssExtra?: SerializedStyles;
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  const isActive =
    (props.to && location.pathname.indexOf(props.to) !== -1 && props.to !== '/') ||
    (location.pathname === '/' && props.to === '/');

  return (
    <Button
      height={`79px`}
      width={`79px`}
      cssExtra={css`
        flex-direction: column;
        font-weight: bold;
        border-bottom: 1px solid ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()};
        max-width: 79px;
        background: ${isActive ? Color(theme.color.neutral[theme.mode][800]).alpha(0.15).string() : 'unset'};
        @media (max-width: 600px) {
          height: 55px;
          width: unset;
          min-width: 70px;
          max-width: 168px;
          font-weight: 500;
          color: ${isActive ? theme.color.primary[800] : ''};
          border-bottom-color: transparent;
          background: none;
          flex-grow: 1;
          flex-basis: 0;
        }
        ${props.cssExtra}
      `}
      colorShade={600}
      backgroundColor={{ base: 'white' }}
      borderRadius={{ base: 0 }}
      border={{ base: '1px solid transparent' }}
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
        if (props.to) {
          history.push(props.to);
        }
        if (props.setIsNavVisibleM) {
          props.setIsNavVisibleM(true);
        }
      }}
      customIcon={
        <span
          css={css`
            svg {
              width: 24px;
              height: 24px;
              fill: ${isActive ? theme.color.primary[800] : theme.color.neutral[theme.mode][1400]};
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
