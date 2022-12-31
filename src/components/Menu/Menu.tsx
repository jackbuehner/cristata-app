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
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    color?: colorType;
    colorShade?: colorShade;
    noEffect?: boolean;
    height?: number;
    disabled?: boolean;
    'data-tip'?: string;
  }>;
  noIcons?: boolean;
  showDisabledLast?: boolean;
  afterClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onEscape?: () => void;
}

const Menu = forwardRef((props: IMenu, ref: React.ForwardedRef<HTMLOListElement>) => {
  const initialHeight = props.items.map((item) => item.height || 32).reduce((total, item) => total + item, 0);

  const forwardedRef = (el: HTMLOListElement) => {
    if (el && typeof ref === 'function') {
      ref(el);
      el.classList.remove('open');
      setTimeout(() => el.classList.add('open'), 10);
    }
  };

  return (
    <MenuList
      top={props.pos.top}
      left={props.pos.left}
      width={props.pos.width}
      ref={forwardedRef}
      style={
        {
          '--height': initialHeight + 'px',
          maxHeight: `calc(100vh - ${props.pos.top}px - 16px)`,
        } as React.CSSProperties
      }
      onKeyDown={(e) => {
        if (e.code === 'Escape') {
          props.onEscape?.();
        }
      }}
    >
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
              onClick={(e) => {
                item.onClick?.(e);
                props.afterClick?.(e);
              }}
              icon={item.icon}
              color={item.color}
              colorShade={item.colorShade}
              noIcons={props.noIcons}
              noEffect={item.noEffect}
              height={item.height}
              disabled={item.disabled}
              data-tip={item['data-tip']}
            >
              {item.label}
            </MenuItem>
          );
        })}
    </MenuList>
  );
});

export { Menu };
