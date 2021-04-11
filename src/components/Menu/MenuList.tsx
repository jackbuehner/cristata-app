import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';

interface IMenuListBase {
  top: number;
  left: number;
}

interface IMenuListComponent extends IMenuListBase {
  theme: themeType;
}

const MenuListComponent = styled.ul<IMenuListComponent>`
  position: fixed;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  z-index: 100;
  background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
  box-shadow: 0 5px 5px -3px rgb(0 0 0 / 20%), 0 8px 10px 1px rgb(0 0 0 / 14%), 0 3px 14px 2px rgb(0 0 0 / 12%);
  padding: 4px 0;
  margin: 0;
  border-radius: ${({ theme }) => theme.radius};
`;

interface IMenuList extends IMenuListBase {
  children: React.ReactNode;
}

function MenuList(props: IMenuList) {
  const theme = useTheme() as themeType;
  return (
    <MenuListComponent top={props.top} left={props.left} theme={theme}>
      {props.children}
    </MenuListComponent>
  );
}

export { MenuList };
