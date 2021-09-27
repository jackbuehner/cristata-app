import styled from '@emotion/styled/macro';
import { themeType } from '../../../../utils/theme/theme';
import { IconButton } from '../../../Button';

interface IToolbarRowIconButton {
  theme: themeType;
  isActive: boolean;
}

const ToolbarRowIconButton = styled(IconButton)<IToolbarRowIconButton>`
  height: 40px;
  width: 40px;
  border: 1px solid transparent;
  background-color: ${({ theme, isActive }) =>
    isActive ? '_' : 'transparent'};
`;

export { ToolbarRowIconButton };
