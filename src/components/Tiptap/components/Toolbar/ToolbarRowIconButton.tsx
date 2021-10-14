import styled from '@emotion/styled/macro';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../../utils/theme/theme';
import { IconButton } from '../../../Button';
import { ButtonProps as IconButtonProps } from '../../../Button/IconButton';

interface IToolbarRowIconButton extends IconButtonProps {
  isActive?: boolean;
}

const ToolbarRowIconButtonComponent = styled(IconButton)<IToolbarRowIconButton>`
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  background-color: ${({ isActive }) => (isActive ? '_' : 'transparent')};
`;

function ToolbarRowIconButton({ color, isActive, ...props }: IToolbarRowIconButton) {
  const theme = useTheme() as themeType;

  return (
    <>
      <ToolbarRowIconButtonComponent
        {...props}
        theme={theme}
        color={color ? color : 'neutral'}
        isActive={isActive ? isActive : false}
      />
    </>
  );
}

export { ToolbarRowIconButton };
