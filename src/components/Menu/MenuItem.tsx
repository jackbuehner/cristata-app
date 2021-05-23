import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { colorShade, colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import { forwardRef } from 'react';

interface IMenuItemBase {
  color?: colorType;
  colorShade?: colorShade;
}

interface IMenuItemComponent extends IMenuItemBase {
  theme: themeType;
}

const MenuItemComponent = styled.li<IMenuItemComponent>`
  list-style: none;
  height: 30px;
  padding: 0 36px 0 16px;
  display: flex;
  align-items: center;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  ${({ theme, color, colorShade }) =>
    buttonEffect(
      color || 'primary',
      colorShade || 700,
      theme,
      false,
      { base: 'transparent' },
      { base: '1px solid transparent' }
    )};
`;

const IconStyleWrapper = styled.span`
  margin: 0 12px 0 -4px;
  width: 16px;
  height: 16px;
  > svg {
    width: 16px;
    height: 16px;
  }
`;

interface IMenuItem extends IMenuItemBase {
  children: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disableLabelAlignmentFix?: boolean;
  noIcons?: boolean;
}

const MenuItem = forwardRef((props: IMenuItem, ref: React.ForwardedRef<HTMLLIElement>) => {
  const theme = useTheme() as themeType;
  return (
    <MenuItemComponent
      onClick={props.onClick}
      onKeyDown={props.onKeyDown}
      theme={theme}
      color={props.color}
      colorShade={props.colorShade}
      tabIndex={-1}
      ref={ref}
    >
      {props.noIcons ? null : <IconStyleWrapper>{props.icon ? props.icon : null}</IconStyleWrapper>}
      <span style={{ marginBottom: props.disableLabelAlignmentFix ? 0 : 1 }}>{props.children}</span>
    </MenuItemComponent>
  );
});

export { MenuItem };
