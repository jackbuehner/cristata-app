import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../utils/theme/theme';

interface NameProps {
  children?: React.ReactText;
}

function Name(props: NameProps) {
  const theme = useTheme() as themeType;

  //@ts-expect-error windowControlsOverlay is only available in some browsers
  const isCustomTitlebarVisible = navigator.windowControlsOverlay?.visible;

  return (
    <WRAPPER_COMPONENET>
      <NAME_COMPONENT theme={theme} isCustomTitlebarVisible={isCustomTitlebarVisible}>
        {props.children}
      </NAME_COMPONENT>
      <BRAND_COMPONENT theme={theme} isCustomTitlebarVisible={isCustomTitlebarVisible}>
        by Cristata
      </BRAND_COMPONENT>
    </WRAPPER_COMPONENET>
  );
}

const WRAPPER_COMPONENET = styled.div`
  display: flex;
  flex-grow: 0;
  flex-shrink: 1;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  user-select: none;
`;

const NAME_COMPONENT = styled.h1<{ theme: themeType; isCustomTitlebarVisible: boolean }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: ${({ theme, isCustomTitlebarVisible }) =>
    theme.color.neutral[isCustomTitlebarVisible ? 'dark' : theme.mode][1400]};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BRAND_COMPONENT = styled.div<{ theme: themeType; isCustomTitlebarVisible: boolean }>`
  display: none;
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 10px;
  line-height: 7px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: ${({ theme, isCustomTitlebarVisible }) =>
    theme.color.neutral[isCustomTitlebarVisible ? 'dark' : theme.mode][1200]};
`;

export { Name };
