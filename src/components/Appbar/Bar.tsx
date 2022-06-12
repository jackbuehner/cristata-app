import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { themeType } from '../../utils/theme/theme';

interface BarProps {
  children?: React.ReactNode;
}

function Bar(props: BarProps) {
  const theme = useTheme() as themeType;

  return <BAR_COMPONENT theme={theme}>{props.children}</BAR_COMPONENT>;
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

export { Bar };
