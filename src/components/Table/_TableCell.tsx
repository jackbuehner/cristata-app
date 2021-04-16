import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

interface ITableCell {
  width?: string | number;
  isHeader?: boolean;
  theme?: themeType;
  styleString?: string;
}

const TableCell = styled.div<ITableCell>`
  padding: 0 0 0 10px;
  min-height: ${({ isHeader }) => (isHeader ? '42px;' : '38px')};
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  width: ${({ width }) => (width ? (typeof width === 'number' ? width + 'px' : width) : 'unset')};
  font-weight: ${({ isHeader }) => (isHeader ? 600 : 400)};
  color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[1200] : theme.color.neutral.dark[1200]};
  font-family: ${({ theme }) => theme.font.detail};
  font-size: ${({ isHeader }) => (isHeader ? 16 : 15)}px;
  white-space: ${({ isHeader }) => (isHeader ? 'nowrap' : 'wrap')};
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  &:last-of-type {
    padding-right: 10px;
  }
  ${({ styleString }) => (styleString ? styleString : null)}
  svg {
    fill: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

export { TableCell };
