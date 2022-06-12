import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { colorType, themeType } from '../../utils/theme/theme';

interface IconProps {
  icon: React.ComponentType;
  color: colorType;
}

function Icon(props: IconProps) {
  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <ICON_COMPONENT theme={theme} color={props.color} isCustomTitlebarVisible={isCustomTitlebarVisible}>
      <props.icon />
    </ICON_COMPONENT>
  );
}

const ICON_COMPONENT = styled.div<{ theme: themeType; color: colorType; isCustomTitlebarVisible: boolean }>`
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
  > span {
    display: contents;
    svg {
      width: 22px;
      height: 22px;
      transform: rotate(-45deg);
      fill: ${({ theme, color, isCustomTitlebarVisible }) => {
        if (color === 'neutral') return theme.color.neutral[theme.mode][1400];
        else if (isCustomTitlebarVisible) return theme.color.neutral.dark[100];
        return theme.color.neutral[theme.mode][100];
      }};
    }
  }
`;

export { Icon };
