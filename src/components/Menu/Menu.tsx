import React, { forwardRef } from 'react';
import { MenuItem, MenuList } from '.';
import { colorShade, colorType } from '../../utils/theme/theme';

interface IMenu {
  pos: {
    top: number;
    left: number;
    width: number;
  };
  items: Array<{
    label: string | React.ReactNode;
    icon?: React.ReactElement;
    onClick?: () => void;
    color?: colorType;
    colorShade?: colorShade;
  }>;
  noIcons?: boolean;
}

const Menu = forwardRef((props: IMenu, ref: React.ForwardedRef<HTMLOListElement>) => {
  return (
    <MenuList top={props.pos.top} left={props.pos.left} width={props.pos.width} ref={ref}>
      {props.items.map((item, index: number) => {
        return (
          <MenuItem
            key={index}
            onClick={item.onClick}
            icon={item.icon}
            color={item.color}
            colorShade={item.colorShade}
            noIcons={props.noIcons}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </MenuList>
  );
});

export { Menu };
