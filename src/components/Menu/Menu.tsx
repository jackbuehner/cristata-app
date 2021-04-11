import { MenuItem, MenuList } from '.';
import { colorShade, colorType } from '../../utils/theme/theme';

interface IMenu {
  pos: {
    top: number;
    left: number;
  };
  items: Array<{
    label: string;
    icon?: React.ReactElement;
    onClick?: () => void;
    color?: colorType;
    colorShade?: colorShade;
  }>;
}

function Menu(props: IMenu) {
  return (
    <MenuList top={props.pos.top} left={props.pos.left}>
      {props.items.map((item, index: number) => {
        return (
          <MenuItem
            key={index}
            onClick={item.onClick}
            icon={item.icon}
            color={item.color}
            colorShade={item.colorShade}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </MenuList>
  );
}

export { Menu };
