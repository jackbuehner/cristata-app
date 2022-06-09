import styled from '@emotion/styled/macro';
import { useState } from 'react';
import { themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface ITableRow {
  isHeader?: boolean;
  theme?: themeType;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  children?: React.ReactNode;
}

function TableRow(props: ITableRow) {
  const [mouseOver, setMouseOver] = useState(false);

  return (
    <TABLE_ROW
      isHeader={props.isHeader}
      theme={props.theme}
      children={props.children}
      onClick={props.onClick}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className={mouseOver ? `table-row--contains-mouse` : ``}
    />
  );
}

const TABLE_ROW = styled.div<ITableRow>`
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
      ? buttonEffect(
          'primary',
          theme.mode === 'light' ? 600 : 300,
          theme,
          false,
          { base: 'transparent' },
          { base: '1px solid transparent' }
        )
      : ``}
`;

export { TableRow };
