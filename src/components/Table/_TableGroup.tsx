import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

interface ITableGroup {
  isHeader?: boolean;
  theme?: themeType;
}

const TableGroup = styled.div<ITableGroup>`
  min-width: 100%;
  width: fit-content;
  ${({ isHeader }) =>
    isHeader
      ? `
          position: sticky;
          top: 0;
          background-color: white;
          z-index: 1;
        `
      : ``}
`;

export { TableGroup };
