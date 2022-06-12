import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowLeft20Regular, ArrowRight20Regular, Home16Regular } from '@fluentui/react-icons';
import Color from 'color';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { themeType } from '../../../../utils/theme/theme';

interface ITitlebar {
  title?: string;
  actions?: Array<{
    label: string;
    icon: React.ReactElement;
    disabled?: boolean;
    action?: () => void;
    isActive?: boolean;
  }>;
  isDisabled?: boolean;
}

function Titlebar(props: ITitlebar) {
  const navigate = useNavigate();
  const theme = useTheme() as themeType;

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  useEffect(() => {
    // on component mount, set the titlebar theme color to blue
    document
      .querySelector(`meta[name='theme-color']`)
      ?.setAttribute(
        `content`,
        theme.mode === 'light'
          ? theme.color.blue[800]
          : Color(theme.color.neutral.dark[100]).lighten(0.5).string()
      );
    return () =>
      // on unmount, set it back to the primary color
      document
        .querySelector(`meta[name='theme-color']`)
        ?.setAttribute(
          `content`,
          theme.mode === 'light'
            ? theme.color.primary[800]
            : Color(theme.color.neutral[theme.mode][200]).darken(0.24).string()
        );
  }, [theme.color.blue, theme.color.neutral, theme.color.primary, theme.mode]);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const customTitlebarOffsetX = navigator.windowControlsOverlay?.getBoundingClientRect?.().x || 0;

  return (
    <Wrapper>
      <TITLEBAR theme={theme} offsetX={customTitlebarOffsetX}>
        <QuickAccess>
          {
            // right controls: <- -> | * * * * | doc title     […] [_] [■] [X]
            // left controls:  [X] [_] [■] | <- -> * * * * | doc title     […]
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
                  data-tip={'Go back'}
                  iconSize={16}
                  width={customTitlebarOffsetX !== 0 ? 33 : undefined}
                >
                  <ArrowLeft20Regular />
                </TitlebarButton>
                <TitlebarButton
                  onClick={() => navigate(1)}
                  data-tip={'Go forward'}
                  iconSize={16}
                  width={customTitlebarOffsetX !== 0 ? 33 : undefined}
                >
                  <ArrowRight20Regular />
                </TitlebarButton>
                {
                  // if the horizontal offset is 0, this means the window controls are on the right, which means we need a divider to separate the larger size history buttons
                  customTitlebarOffsetX === 0 ? <Divider /> : null
                }
              </>
            ) : null
          }
          <TitlebarButton onClick={() => navigate('/')} data-tip={'Navigate home'} iconSize={16} width={33}>
            <Home16Regular />
          </TitlebarButton>
          {props.actions?.map((action, index) => {
            return (
              <TitlebarButton
                key={index}
                data-tip={action.label}
                width={33}
                iconSize={action.label === 'Save' ? 20 : undefined}
                onClick={action.action}
                isActive={action.isActive}
                disabled={props.isDisabled || action.disabled}
              >
                {action.icon}
              </TitlebarButton>
            );
          })}
        </QuickAccess>
        <Divider />
        <Title>{props.title || 'Cristata'}</Title>
      </TITLEBAR>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  flex-grow: 0;
  flex-shrink: 0;
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
      ? theme.color.blue[800]
      : Color(theme.color.neutral.dark[100]).lighten(0.5).string()};
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

const Title = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  font-size: 13px;
  color: white;
  flex-grow: 1;
  flex-shrink: 1;
  height: 100%;
  margin-top: calc(13px / 6 * -1);
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
  display: inline-block;
  line-height: env(titlebar-area-height, 33px);
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
