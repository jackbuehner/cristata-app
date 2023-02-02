import styled from '@emotion/styled';
import type { themeType } from '../../utils/theme/theme';

interface ITableDiv {
  theme?: themeType;
  noOverflow?: boolean;
}

const TableDiv = styled.div<ITableDiv>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  height: fit-content;
  max-height: 100%;
  overflow: ${({ noOverflow }) => (noOverflow ? 'hidden' : 'auto')};
  margin: 1;
  box-shadow: 0 0 0 1px
    ${({ theme }) => (theme.mode === 'light' ? theme.color.neutral.light[200] : theme.color.neutral.dark[200])};
  border-radius: ${({ theme }) => theme.radius};
`;

export { TableDiv };
