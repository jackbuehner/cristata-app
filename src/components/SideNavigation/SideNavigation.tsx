import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import { useLocation } from 'svelte-preprocess-react/react-router';
import { useNavigationConfig } from '../../hooks/useNavigationConfig';
import type { themeType } from '../../utils/theme/theme';

interface SideNavigationProps {
  isNavVisible: boolean;
  setIsNavVisible: () => boolean;
  children: React.ReactNode;
}

function SideNavigation({ isNavVisible, setIsNavVisible, ...props }: SideNavigationProps) {
  const theme = useTheme() as themeType;
  const location = useLocation();
  const [mainNav] = useNavigationConfig('main');
  const width = 300;
  const tenant = location.pathname.split('/')[1];

  const isCollapsedAtPath: boolean | undefined =
    mainNav?.find(
      (item) =>
        item.to === location.pathname.replace(`/${tenant}` || '', '') ||
        item.to === location.pathname.replace(tenant || '', '')
    )?.subNav === 'forceCollapseForRoute' ||
    location.pathname.includes(`/${tenant}/configuration`) ||
    location.pathname.includes(`/${tenant}/profile`) ||
    location.pathname.includes(`/${tenant}/cms`);

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <SideNavigationComponent
      theme={theme}
      width={isCollapsedAtPath ? 0 : width}
      isNavVisible={isNavVisible}
      isCustomTitlebarVisible={isCustomTitlebarVisible}
    >
      {props.children}
    </SideNavigationComponent>
  );
}

const SideNavigationComponent = styled.div<{
  theme: themeType;
  width: number;
  isNavVisible: boolean;
  isCustomTitlebarVisible: boolean;
}>`
  width: ${({ width }) => width}px;
  background-color: ${({ theme, isCustomTitlebarVisible }) => {
    if (theme.mode === 'light') {
      if (isCustomTitlebarVisible) return Color(theme.color.primary[100]).lighten(0.04).string();
      return 'white';
    }
    return theme.color.neutral.dark[100];
  }};
  // border-right: 1px solid
  //   ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[200]};
  overflow-x: hidden;
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  height: 100%;
  ${({ isCustomTitlebarVisible, theme }) =>
    isCustomTitlebarVisible
      ? `box-shadow: ${Color(theme.color.primary[800])
          .alpha(0.05)
          .string()} 0px 2px 4px 1px, rgb(0 0 0 / 5%) 0px 8px 16px -4px;`
      : ``}
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
  z-index: 999;
  flex-grow: 0;
  flex-shrink: 0;
`;

export { SideNavigation };
