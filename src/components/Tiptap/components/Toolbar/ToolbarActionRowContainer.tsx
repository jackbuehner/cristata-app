import styled from '@emotion/styled';
import { themeType } from '../../../../utils/theme/theme';

interface IToolbarActionRowContainer {
  theme: themeType;
}

const ToolbarActionRowContainer = styled.div<IToolbarActionRowContainer>`
  width: 100%;
  box-sizing: border-box;
  height: fit-content;
  min-height: 40px;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  padding: 0px 8px;
  display: flex;
`;

export { ToolbarActionRowContainer };
