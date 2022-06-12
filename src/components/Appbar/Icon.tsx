import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { colorType, themeType } from '../../utils/theme/theme';

interface IconProps {
  icon: React.ComponentType;
  color: colorType;
}

function Icon(props: IconProps) {
  const theme = useTheme() as themeType;

  return (
    <ICON_COMPONENT theme={theme} color={props.color}>
      <props.icon />
    </ICON_COMPONENT>
  );
}

const ICON_COMPONENT = styled.div<{ theme: themeType; color: colorType }>`
  margin: 11px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 26px;
  width: 26px;
  background-color: ${({ theme, color }) => {
    if (color === 'neutral') return theme.color.neutral[theme.mode][theme.mode === 'light' ? 200 : 300];
    return theme.color[color][theme.mode === 'light' ? 800 : 300];
  }};
  border-radius: ${({ theme }) => theme.radius};
  flex-grow: 0;
  flex-shrink: 0;
  transform: rotate(45deg);
  > span {
    display: contents;
    svg {
      width: 22px;
      height: 22px;
      transform: rotate(-45deg);
      fill: ${({ theme, color }) => {
        if (color === 'neutral') return theme.color.neutral[theme.mode][1400];
        return theme.color.neutral[theme.mode][100];
      }};
    }
  }
`;

export { Icon };
