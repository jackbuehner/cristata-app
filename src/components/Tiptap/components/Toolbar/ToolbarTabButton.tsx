import styled from '@emotion/styled';
import { themeType } from '../../../../utils/theme/theme';
import { Button } from '../../../Button';

interface IToolbarTabButton {
  theme: themeType;
  isActive?: boolean;
}

const ToolbarTabButton = styled(Button)<IToolbarTabButton>`
  position: relative;
  border: 1px solid transparent;
  padding: 0px 21px;
  border-radius: 0px;
  height: 32px;
  background-color: transparent;
  -webkit-app-region: no-drag;
  app-region: no-drag;
  min-width: 0;
  ${({ theme, isActive }) =>
    isActive
      ? `
        &::after {
          content: '';
          position: absolute;
          width: calc(100% - 28px);
          height: 3px;
          background-color: ${theme.mode === 'light' ? theme.color.blue[800] : theme.color.blue[400]};
          bottom: -1px;
          left: 14px;
          display: flex;
          transition: width 0.1s ease 0s, left 0.1s ease 0s;
        }
        &:hover:not(:active)::after {
          width: 100%;
          left: 0px;
        }
        `
      : null}
`;

export { ToolbarTabButton };
