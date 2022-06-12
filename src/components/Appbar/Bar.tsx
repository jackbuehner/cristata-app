import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { LinearProgress } from '@rmwc/linear-progress';
import Color from 'color';
import { themeType } from '../../utils/theme/theme';

interface BarProps {
  children?: React.ReactNode;
  loading?: boolean;
}

function Bar(props: BarProps) {
  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <div style={{ position: 'relative' }}>
      <BAR_COMPONENT theme={theme} isCustomTitlebarVisible={isCustomTitlebarVisible}>
        {props.children}
      </BAR_COMPONENT>
      {props.loading ? (
        <IndeterminateProgress theme={theme} isCustomTitlebarVisible={isCustomTitlebarVisible} />
      ) : null}
    </div>
  );
}

const BAR_COMPONENT = styled.div<{ theme: themeType; isCustomTitlebarVisible: boolean }>`
  display: flex;
  flex-direction: row;
  height: ${({ theme }) => theme.dimensions.appbar.height};
  width: 100%;
  background-color: ${({ theme, isCustomTitlebarVisible }) => {
    if (isCustomTitlebarVisible) return theme.color.primary[800];
    else if (theme.mode === 'light') return Color(theme.color.neutral[theme.mode][100]).string();
    return Color(theme.color.neutral[theme.mode][200]).darken(0.24).string();
  }};
  border-bottom: 1px solid
    ${({ theme }) => {
      if (theme.mode === 'light') return theme.color.neutral.light[300];
      return theme.color.neutral.dark[200];
    }};
  flex-grow: 0;
  flex-shrink: 0;
  ${({ isCustomTitlebarVisible, theme }) =>
    isCustomTitlebarVisible
      ? `
          -webkit-app-region: drag;
          app-region: drag;
          box-shadow: ${Color(theme.color.primary[800])
            .alpha(0.05)
            .string()} 0px 4px 4px 1px, rgb(0 0 0 / 10%) 0px 8px 16px -4px;
          border-bottom: none;
        `
      : ``}
`;

/**
 * The indeterminate progressbar that appears at the bottom of the page header when `isLoading` is `true`.
 *
 * It appears underneath the title when there are children, and it appears at the top of the modal
 * when there are no children
 */
const IndeterminateProgress = styled(LinearProgress)<{
  theme: themeType;
  progress?: number;
  isCustomTitlebarVisible: boolean;
}>`
  --mdc-theme-primary: ${({ theme, isCustomTitlebarVisible }) =>
    isCustomTitlebarVisible
      ? theme.color.neutral.dark[1200]
      : theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  position: absolute !important;
  left: 0;
  bottom: 1px;
  .mdc-linear-progress__buffer {
    background-color: ${({ theme, isCustomTitlebarVisible }) => {
      if (isCustomTitlebarVisible) return theme.color.primary[800];
      else if (theme.mode === 'light') return Color(theme.color.neutral[theme.mode][100]).string();
      return Color(theme.color.neutral[theme.mode][200]).darken(0.24).string();
    }};
  }
  .mdc-linear-progress__buffering-dots {
    filter: ${({ theme }) => `invert(${theme.mode === 'light' ? 0 : 1})`};
  }
`;

export { Bar };
