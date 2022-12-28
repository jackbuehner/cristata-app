import styled from '@emotion/styled';
import { IconButton } from '../../../Button';

interface IToolbarMetaIconButton {
  isActive?: boolean;
}

const ToolbarMetaIconButton = styled(IconButton)<IToolbarMetaIconButton>`
  position: relative;
  border: 1px solid transparent;
  height: 32px;
  width: 32px;
  background-color: ${({ isActive }) => (isActive ? '_' : 'transparent')};
  -webkit-app-region: no-drag;
  app-region: no-drag;
`;

export { ToolbarMetaIconButton };
