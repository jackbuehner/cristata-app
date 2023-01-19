import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';
import { useAppDispatch } from '../../redux/hooks';
import { setAppIcon } from '../../redux/slices/appbarSlice';
import type { colorType, themeType } from '../../utils/theme/theme';
import { FluentIcon, type FluentIconNames } from '../FluentIcon';

interface IconProps {
  icon: FluentIconNames;
  color: colorType;
  name: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  drag?: boolean;
}

function Icon(props: IconProps) {
  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  if (props.name === 'Cristata') {
    return (
      <LogoSvg
        theme={theme}
        isCustomTitlebarVisible={isCustomTitlebarVisible}
        xmlns='http://www.w3.org/2000/svg'
        width='41.57'
        height='26'
        viewBox='0 0 31.1775 36'
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      >
        <path d='m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z' />
        <path d='M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z' />
      </LogoSvg>
    );
  }

  return (
    <ICON_COMPONENT
      theme={theme}
      color={props.color}
      isCustomTitlebarVisible={isCustomTitlebarVisible}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      drag={props.drag || false}
    >
      <FluentIcon name={props.icon} />
      <SyncIcon />
    </ICON_COMPONENT>
  );
}

function SyncIcon() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [mainNav] = useNavigationConfig('main');

  //update app bar icon based on routes
  useEffect(() => {
    if (mainNav) {
      const matchedRoute = mainNav.find((item) => location.pathname === item.to);

      if (matchedRoute) {
        dispatch(setAppIcon(matchedRoute.icon || 'ContentView20Regular'));
      } else if (location.pathname.includes('/cms')) {
        dispatch(setAppIcon('ContentView20Regular'));
      }
    }
  }, [dispatch, location, mainNav]);

  return null;
}

const ICON_COMPONENT = styled.div<{
  theme: themeType;
  color: colorType;
  isCustomTitlebarVisible: boolean;
  drag?: boolean;
}>`
  margin: 11px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 26px;
  width: 26px;
  background-color: ${({ theme, color, isCustomTitlebarVisible }) => {
    if (color === 'neutral') return theme.color.neutral[theme.mode][theme.mode === 'light' ? 200 : 300];
    else if (isCustomTitlebarVisible) return theme.color[color][300];
    return theme.color[color][theme.mode === 'light' ? 800 : 300];
  }};
  border-radius: ${({ theme }) => theme.radius};
  flex-grow: 0;
  flex-shrink: 0;
  transform: rotate(45deg);
  ${({ drag }) =>
    drag
      ? `
          -webkit-app-region: drag;
          app-region: drag;
        `
      : `
          -webkit-app-region: no-drag;
          app-region: no-drag;
  `}
  > svg {
    width: 22px;
    height: 22px;
    transform: rotate(-45deg);
    color: ${({ theme, color, isCustomTitlebarVisible }) => {
      if (color === 'neutral') return theme.color.neutral[theme.mode][1400];
      else if (isCustomTitlebarVisible) return theme.color.neutral.dark[100];
      return theme.color.neutral[theme.mode][100];
    }};
    fill: ${({ theme, color, isCustomTitlebarVisible }) => {
      if (color === 'neutral') return theme.color.neutral[theme.mode][1400];
      else if (isCustomTitlebarVisible) return theme.color.neutral.dark[100];
      return theme.color.neutral[theme.mode][100];
    }};
  }
`;

const LogoSvg = styled.svg<{ theme: themeType; isCustomTitlebarVisible: boolean }>`
  fill: ${({ theme, isCustomTitlebarVisible }) => {
    if (isCustomTitlebarVisible && theme.mode === 'light') return theme.color.neutral.dark[100];
    return theme.color.primary[theme.mode === 'light' ? 800 : 300];
  }};
  margin: 8px 16px;
  width: 30px;
  height: 30px;
  padding: 0;
  -webkit-app-region: no-drag;
  app-region: no-drag;
`;

export { Icon };
