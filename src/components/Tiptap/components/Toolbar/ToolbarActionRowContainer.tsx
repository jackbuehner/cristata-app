import styled from '@emotion/styled/macro';
import Color from 'color';
import { themeType } from '../../../../utils/theme/theme';

interface IToolbarActionRowContainer {
  theme: themeType;
}

const ToolbarActionRowContainer = styled.div<IToolbarActionRowContainer>`
  width: 100%;
  box-sizing: border-box;
  height: fit-content;
  min-height: 40px;
  background-color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.neutral.light[100]
      : Color(theme.color.neutral.dark[100]).lighten(0.5).string()};
  padding: 0px 8px;
  display: flex;
`;

export { ToolbarActionRowContainer };
