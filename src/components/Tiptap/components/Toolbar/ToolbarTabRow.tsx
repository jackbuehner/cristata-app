import styled from '@emotion/styled';
import { themeType } from '../../../../utils/theme/theme';

interface IToolbarTabRow {
  theme: themeType;
  width: number;
}

const ToolbarTabRow = styled.div<IToolbarTabRow>`
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  display: flex;
  justify-content: flex-start;
  white-space: nowrap;
  height: ${({ width }) => (width < 450 ? 72 : 36)}px;
  flex-direction: ${({ width }) => (width < 450 ? 'column-reverse' : 'row')};
  position: relative;
`;

export { ToolbarTabRow };
