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

  return (
    <div style={{ position: 'relative' }}>
      <BAR_COMPONENT theme={theme}>{props.children}</BAR_COMPONENT>
      {props.loading ? <IndeterminateProgress theme={theme} /> : null}
    </div>
  );
}

const BAR_COMPONENT = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  height: ${({ theme }) => theme.dimensions.appbar.height};
  width: 100%;
  background-color: ${({ theme }) =>
    theme.mode === 'light'
      ? Color(theme.color.neutral[theme.mode][100]).string()
      : Color(theme.color.neutral[theme.mode][200]).darken(0.24).string()};
  border-bottom: 1px solid
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[200])};
  flex-grow: 0;
  flex-shrink: 0;
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
}>`
  --mdc-theme-primary: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  position: absolute !important;
  left: 0;
  bottom: 1px;
  .mdc-linear-progress__buffer {
    background-color: ${({ theme }) =>
      theme.mode === 'light'
        ? Color(theme.color.neutral[theme.mode][100]).string()
        : Color(theme.color.neutral[theme.mode][200]).darken(0.24).string()};
  }
  .mdc-linear-progress__buffering-dots {
    filter: ${({ theme }) => `invert(${theme.mode === 'light' ? 0 : 1})`};
  }
`;

export { Bar };
