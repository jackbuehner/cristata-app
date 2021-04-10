import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

interface ITableDiv {
  theme?: themeType;
}

const TableDiv = styled.div<ITableDiv>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  height: fit-content;
  max-height: 100%;
  overflow: auto;
  border: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
  border-radius: ${({ theme }) => theme.radius};
`;

export { TableDiv };
