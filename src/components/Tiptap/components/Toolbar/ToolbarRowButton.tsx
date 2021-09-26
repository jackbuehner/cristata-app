import styled from '@emotion/styled';
import { themeType } from '../../../../utils/theme/theme';
import { Button } from '../../../Button';

interface IToolbarRowButton {
  theme: themeType;
  isActive: boolean;
}

const ToolbarRowButton = styled(Button)<IToolbarRowButton>`
  height: 40px;
  min-width: 40px;
  border: 1px solid transparent;
  background-color: ${({ theme, isActive }) =>
    isActive ? '_' : 'transparent'};
  > span[class*='IconStyleWrapper'] {
    width: 20px;
    height: 20px;
  }
`;

export { ToolbarRowButton };
