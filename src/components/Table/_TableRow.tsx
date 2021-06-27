import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface ITableRow {
  isHeader?: boolean;
  theme?: themeType;
  onClick?: () => void;
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
  ${({ onClick, theme }) =>
    onClick
      ? buttonEffect('primary', 600, theme, false, { base: 'transparent' }, { base: '1px solid transparent' })
      : ``}
`;

export { TableRow };
