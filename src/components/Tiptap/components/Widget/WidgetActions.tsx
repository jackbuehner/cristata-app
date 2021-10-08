import { colorType, themeType } from '../../../../utils/theme/theme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { IconButton } from '../../../Button';

interface IWidgetActions extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isVisible?: boolean;
  actions: {
    color?: colorType;
    disabled?: boolean;
    icon: React.ReactElement;
    label: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }[];
}

function WidgetActions({ isVisible, actions, ...props }: IWidgetActions) {
  const theme = useTheme() as themeType;

  return (
    <WidgetActionsComponent {...props} theme={theme} isVisible={isVisible !== undefined ? isVisible : true}>
      {actions.map(({ color, disabled, icon, onClick }, index) => {
        return (
          <IconButton
            backgroundColor={{ base: 'transparent' }}
            border={{ base: '1px solid transparent' }}
            color={color ? color : 'neutral'}
            disabled={disabled}
            height={`28px`}
            icon={icon}
            key={index}
            onClick={onClick}
            width={`28px`}
          />
        );
      })}
    </WidgetActionsComponent>
  );
}

interface IWidgetActionsComponent {
  theme: themeType;
  isVisible: boolean;
}

const WidgetActionsComponent = styled.div<IWidgetActionsComponent>`
  width: fit-content;
  background: white;
  position: absolute;
  top: -18px;
  right: 10px;
  border: ${({ theme }) => `1px solid ${theme.color.neutral[theme.mode][200]}`};
  border-radius: ${({ theme }) => theme.radius};
  box-sizing: border-box;
  display: flex;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity 120ms ease-out;
  flex-direction: row;
  align-items: center;
  padding: 1px;
`;

export { WidgetActions };