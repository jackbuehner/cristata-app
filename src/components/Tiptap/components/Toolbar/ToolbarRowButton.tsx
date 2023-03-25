import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { themeType } from '../../../../utils/theme/theme';
import { Button } from '../../../Button';
import type { ButtonProps } from '../../../Button/Button';

interface IToolbarRowButton extends ButtonProps {
  isActive?: boolean;
}

const ToolbarRowButtonComponent = styled(Button)<IToolbarRowButton>`
  height: 40px;
  min-width: 40px;
  border: 1px solid transparent;
  background-color: ${({ isActive }) => (isActive ? '_' : 'transparent')};
  -webkit-app-region: no-drag;
  app-region: no-drag;
  > span[class*='IconStyleWrapper'] {
    width: 20px;
    height: 20px;
    > svg {
      width: 20px;
      height: 20px;
    }
  }
`;

function ToolbarRowButton({ children, color, isActive, ...props }: IToolbarRowButton) {
  const theme = useTheme() as themeType;

  return (
    <>
      <ToolbarRowButtonComponent
        {...props}
        theme={theme}
        color={color ? color : 'primary'}
        isActive={isActive ? isActive : false}
      >
        {children}
      </ToolbarRowButtonComponent>
    </>
  );
}

export { ToolbarRowButton };
