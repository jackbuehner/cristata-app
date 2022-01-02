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
    noEffect?: boolean;
    height?: number;
    disabled?: boolean;
  }>;
  noIcons?: boolean;
  showDisabledLast?: boolean;
}

const Menu = forwardRef((props: IMenu, ref: React.ForwardedRef<HTMLOListElement>) => {
  return (
    <MenuList top={props.pos.top} left={props.pos.left} width={props.pos.width} ref={ref}>
      {props.items
        // move disabled items to bottom
        .sort((a, b) => {
          if (props.showDisabledLast) {
            if (a.disabled && b.disabled) return 0;
            else if (a.disabled && !b.disabled) return 1;
            return -1;
          }
          return 0;
        })
        .map((item, index: number) => {
          return (
            <MenuItem
              key={index}
              onClick={item.onClick}
              icon={item.icon}
              color={item.color}
              colorShade={item.colorShade}
              noIcons={props.noIcons}
              noEffect={item.noEffect}
              height={item.height}
              disabled={item.disabled}
            >
              {item.label}
            </MenuItem>
          );
        })}
    </MenuList>
  );
});

export { Menu };
