/** @jsxImportSource @emotion/react */
import { css, useTheme } from '@emotion/react';
import Color from 'color';
import { ReactText } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Button } from '.';
import { themeType } from '../../utils/theme/theme';

function SideNavMainButton(props: { children: ReactText; Icon: JSX.Element; to?: string }) {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  return (
    <Button
      height={`79px`}
      width={`79px`}
      cssExtra={css`
        flex-direction: column;
        font-weight: bold;
        border-bottom: 1px solid ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()};
        max-width: 79px;
        background: ${props.to && location.pathname.indexOf(props.to) !== -1 && props.to !== '/'
          ? Color(theme.color.neutral[theme.mode][800]).alpha(0.15).string()
          : 'unset'};
      `}
      backgroundColor={{ base: 'white' }}
      borderRadius={{ base: 0 }}
      border={{ base: '1px solid transparent' }}
      onClick={() => (props.to ? history.push(props.to) : null)}
      customIcon={
        <span
          css={css`
            svg {
              width: 24px;
              height: 24px;
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
