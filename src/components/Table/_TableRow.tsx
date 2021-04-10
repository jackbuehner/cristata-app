import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

interface ITableRow {
  isHeader?: boolean;
  theme?: themeType;
}

const TableRow = styled.div<ITableRow>`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  width: 100%;
  border-bottom: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  ${({ isHeader }) =>
    isHeader
      ? `
          position: sticky;
          top: 0;
          background-color: white;
        `
      : ``}
`;

export { TableRow };
