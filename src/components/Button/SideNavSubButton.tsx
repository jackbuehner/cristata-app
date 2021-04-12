/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import Color from 'color';
import { ReactText } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button } from '.';
import { themeType } from '../../utils/theme/theme';

function SideNavSubButton(props: { children: ReactText; Icon: JSX.Element; to?: string }) {
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme() as themeType;

  return (
    <Button
      height={`36px`}
      width={`calc(100% - 12px)`}
      cssExtra={css`
        flex-direction: row;
        font-weight: bold;
        margin: 0 6px 2px 6px;
        justify-content: flex-start;
        background: ${props.to && location.pathname.indexOf(props.to) !== -1
          ? Color(theme.color.neutral[theme.mode][800]).alpha(0.15).string()
          : 'unset'};
      `}
      backgroundColor={{ base: 'white' }}
      border={{ base: '1px solid transparent' }}
      onClick={() => (props.to ? history.push(props.to) : null)}
      customIcon={
        <span
          css={css`
            width: 24px;
            height: 24px;
            margin-right: 6px;
            svg {
              width: 24px;
              height: 24px;
            }
          `}
        >
          {props.Icon}
        </span>
      }
    >
      {props.children}
    </Button>
  );
}

export { SideNavSubButton };
