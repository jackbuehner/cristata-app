import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowLeft20Regular, ArrowRight20Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useNavigate } from 'react-router-dom';
import { themeType } from '../../utils/theme/theme';
import { useEffect } from 'react';

interface ITitlebar {
  title?: string;
}

function Titlebar(props: ITitlebar) {
  const navigate = useNavigate();
  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const customTitlebarOffsetX = navigator.windowControlsOverlay?.getBoundingClientRect?.().x || 0;

  // on component mount, set the titlebar theme
  useEffect(() => {
    document
      .querySelector(`meta[name='theme-color']`)
      ?.setAttribute(
        `content`,
        theme.mode === 'light'
          ? theme.color.primary[800]
          : Color(theme.color.neutral[theme.mode][200]).darken(0.24).string()
      );
  }, [theme.color.neutral, theme.color.primary, theme.mode]);

  return (
    <Wrapper>
      <TITLEBAR theme={theme} offsetX={customTitlebarOffsetX}>
        <QuickAccess>
          {
            // right controls: <- -> | title     […] [_] [■] [X]
            // left controls:  [X] [_] [■] | <- -> | title     […]
          }
          {
            // if the horizontal offset is greater than 0, this means the window controls are on the left, which means we need a divider to separate the window controls from the quick access buttons
            customTitlebarOffsetX > 0 ? <Divider /> : null
          }
          {
            // only show history navigation when the titlebar replaces the default titlebar
            //@ts-expect-error windowControlsOverlay is only available in some browsers
            navigator.windowControlsOverlay?.visible ? (
              <>
                <TitlebarButton
                  onClick={() => navigate(-1)}
                  title={'Go back'}
                  iconSize={16}
                  width={customTitlebarOffsetX !== 0 ? 33 : undefined}
                >
                  <ArrowLeft20Regular />
                </TitlebarButton>
                <TitlebarButton
                  onClick={() => navigate(1)}
                  title={'Go forward'}
                  iconSize={16}
                  width={customTitlebarOffsetX !== 0 ? 33 : undefined}
                >
                  <ArrowRight20Regular />
                </TitlebarButton>
              </>
            ) : null
          }
        </QuickAccess>
      </TITLEBAR>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  flex-grow: 0;
  flex-shrink: 0;

  @media print {
    display: none;
  }
`;

const TITLEBAR = styled.div<{ theme: themeType; offsetX: number }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  left: env(titlebar-area-x, 0);
  top: env(titlebar-area-y, 0);
  width: env(titlebar-area-width, 100%);
  height: env(titlebar-area-height, 33px);
  background-color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.primary[800]
      : Color(theme.color.neutral[theme.mode][200]).darken(0.24).string()};
  -webkit-app-region: drag;
  app-region: drag;
`;

const QuickAccess = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TitlebarButton = styled.button<{
  iconSize?: number;
  width?: number;
  isActive?: boolean;
  disabled?: boolean;
}>`
  width: ${({ width }) => (width ? width : 48)}px;
  height: 100%;
  appearance: none;
  background-color: ${({ isActive }) => (isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent')};
  border: none;
  color: white;
  border-radius: 0;
  -webkit-app-region: no-drag;
  app-region: no-drag;
  svg {
    margin-top: ${({ iconSize }) => (iconSize ? iconSize / 4 : 16 / 4)}px;
    width: ${({ iconSize }) => (iconSize ? iconSize : 16)}px;
    height: ${({ iconSize }) => (iconSize ? iconSize : 16)}px;
  }
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.16);
  }
  &:focus {
    outline: none;
  }
`;

const Divider = styled.div`
  width: 0;
  height: 60%;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
  margin: 0 8px;
`;

export { Titlebar };
