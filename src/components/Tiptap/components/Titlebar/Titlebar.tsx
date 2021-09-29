import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ArrowLeft20Regular, ArrowRight20Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
}

function Titlebar(props: ITitlebar) {
  const history = useHistory();
  const theme = useTheme() as themeType;

  useEffect(() => {
    // on component mount, set the titlebar theme color to blue
    document.querySelector(`meta[name='theme-color']`)?.setAttribute(`content`, theme.color.blue[800]);
    return () =>
      // on unmount, set it back to the primary color
      document.querySelector(`meta[name='theme-color']`)?.setAttribute(`content`, theme.color.primary[800]);
  }, [theme.color.blue, theme.color.primary]);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const customTitlebarOffsetX = navigator.windowControlsOverlay.getBoundingClientRect().x;

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
                  onClick={() => history.goBack()}
                  title={'Go back'}
                  iconSize={16}
                  width={customTitlebarOffsetX !== 0 ? 33 : undefined}
                >
                  <ArrowLeft20Regular />
                </TitlebarButton>
                <TitlebarButton
                  onClick={() => history.goForward()}
                  title={'Go forward'}
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
          {props.actions?.map((action, index) => {
            return (
              <TitlebarButton
                title={action.label}
                width={33}
                iconSize={action.label === 'Save' ? 20 : undefined}
                onClick={action.action}
                isActive={action.isActive}
                disabled={action.disabled}
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
  background-color: ${({ theme }) => theme.color.blue[800]};
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
