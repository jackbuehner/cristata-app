import styled from '@emotion/styled/macro';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../../utils/theme/theme';
import { Button } from '../../../Button';
import { ButtonProps } from '../../../Button/Button';

interface IToolbarRowButton extends ButtonProps {
  isActive?: boolean;
}

const ToolbarRowButtonComponent = styled(Button)<IToolbarRowButton>`
  height: 40px;
  min-width: 40px;
  border: 1px solid transparent;
  background-color: ${({ isActive }) => (isActive ? '_' : 'transparent')};
  > span[class*='IconStyleWrapper'] {
    width: 20px;
    height: 20px;
    > span > svg {
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
        color={color ? color : 'neutral'}
        isActive={isActive ? isActive : false}
      >
        {children}
      </ToolbarRowButtonComponent>
    </>
  );
}

export { ToolbarRowButton };
