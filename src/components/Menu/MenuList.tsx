import styled from '@emotion/styled/macro';
import { useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { forwardRef } from 'react';
import React from 'react';

interface IMenuListBase {
  top: number;
  left: number;
  width: number;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

interface IMenuListComponent extends IMenuListBase {
  theme: themeType;
}

const MenuListComponent = styled.ul<IMenuListComponent>`
  position: fixed;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  width: ${({ width }) => width}px;
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

/**
 * Component to hold MenuItems. When any child of this component is focused,
 * up and down arrow keys can be used to navigate focus between the children.
 */
const MenuList = forwardRef((props: IMenuList, ref: React.ForwardedRef<HTMLOListElement>) => {
  const theme = useTheme() as themeType;

  /**
   * If the menu is focused (not a mneuitem), focus the first menuitem
   */
  const handleMenuArrowNavigation = (e: React.KeyboardEvent) => {
    const isMenuFocused = document.activeElement?.classList.contains('menu');
    if (isMenuFocused && e.key === 'ArrowDown') {
      (e.currentTarget?.firstElementChild as HTMLElement)?.focus();
    }
  };

  /**
   * If a menuitem is focused, navigate the menu with arrow keys.
   */
  const handleMenuItemArrowNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      (e.currentTarget?.nextSibling as HTMLElement)?.focus();
    } else if (e.key === 'ArrowUp') {
      (e.currentTarget?.previousSibling as HTMLElement)?.focus();
    } else if (e.key === 'Enter') {
      (e.currentTarget as HTMLElement)?.click();
    }
  };

  return (
    <MenuListComponent
      top={props.top}
      left={props.left}
      width={props.width}
      theme={theme}
      ref={ref}
      tabIndex={-1}
      onKeyDown={props.onKeyDown ? props.onKeyDown : handleMenuArrowNavigation}
      className={`menu`}
    >
      {React.Children.map(props.children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            key: index,
            onKeyDown: handleMenuItemArrowNavigation,
          });
        }
        return child;
      })}
    </MenuListComponent>
  );
});

export { MenuList };
