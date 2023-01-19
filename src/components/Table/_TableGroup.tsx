import styled from '@emotion/styled';
import type { themeType } from '../../utils/theme/theme';

interface ITableGroup {
  isHeader?: boolean;
  theme?: themeType;
}

const TableGroup = styled.div<ITableGroup>`
  min-width: 100%;
  width: fit-content;
  ${({ isHeader, theme }) =>
    isHeader
      ? `
          position: sticky;
          top: 0;
          background-color: ${theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100]};
          z-index: 1;
        `
      : ``}
`;

export { TableGroup };
