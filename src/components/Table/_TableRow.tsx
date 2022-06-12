import styled from '@emotion/styled/macro';
import Color from 'color';
import { useRef, useState } from 'react';
import { themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface ITableRow {
  isHeader?: boolean;
  theme?: themeType;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  children?: React.ReactNode;
  isChecked?: boolean;
}

function TableRow(props: ITableRow) {
  const [mouseOver, setMouseOver] = useState(false);

  const timer = useRef<NodeJS.Timeout>();
  const handleOnClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (timer.current) clearTimeout(timer.current);

    if (event.detail === 1) {
      timer.current = setTimeout(() => props.onClick?.(event), 200);
    } else if (event.detail === 2) {
      props.onDoubleClick?.(event);
    }
  };

  return (
    <TABLE_ROW
      isHeader={props.isHeader}
      theme={props.theme}
      children={props.children}
      onClick={handleOnClick}
      canClick={!!props.onClick || !!props.onDoubleClick}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className={mouseOver ? `table-row--contains-mouse` : ``}
      isChecked={props.isChecked}
    />
  );
}

const TABLE_ROW = styled.div<ITableRow & { canClick: boolean }>`
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  width: 100%;
  border-bottom: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[200] : theme.color.neutral.dark[200]};
  ${({ isHeader }) =>
    isHeader
      ? `
          position: sticky;
          top: 0;
          background-color: white;
        `
      : ``}
  ${({ canClick, theme, isChecked }) =>
    canClick
      ? buttonEffect(
          'primary',
          theme.mode === 'light' ? 600 : 300,
          theme,
          false,
          { base: isChecked ? Color(theme.color.neutral[theme.mode][200]).alpha(0.5).string() : 'transparent' },
          { base: '1px solid transparent' }
        )
      : ``}
`;

export { TableRow };
