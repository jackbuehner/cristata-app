import styled from '@emotion/styled/macro';
import { useTheme } from '@emotion/react';
import { colorShade, colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import { forwardRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';

interface IMenuItemBase {
  color?: colorType;
  colorShade?: colorShade;
  noEffect?: boolean;
  height?: number;
  disabled?: boolean;
  'data-tip'?: string;
}

interface IMenuItemComponent extends IMenuItemBase {
  theme: themeType;
}

const MenuItemComponent = styled.li<IMenuItemComponent>`
  list-style: none;
  height: ${({ height }) => (height ? height : 30)}px;
  padding: 0 36px 0 16px;
  display: flex;
  align-items: center;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  cursor: ${({ disabled, 'data-tip': dataTip }) => (disabled && dataTip ? 'help' : 'default')};
  color: ${({ theme, disabled }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1400]};
  ${({ theme, color, colorShade, noEffect }) =>
    noEffect
      ? ''
      : buttonEffect(
          color || 'primary',
          colorShade || theme.mode === 'light' ? 700 : 300,
          theme,
          false,
          { base: 'transparent' },
          { base: '1px solid transparent' }
        )};
  width: 100%;
  box-sizing: border-box;
`;

const IconStyleWrapper = styled.span`
  margin: 0 12px 0 -4px;
  width: 16px;
  height: 16px;
  svg {
    width: 16px;
    height: 16px;
  }
`;

interface IMenuItem extends IMenuItemBase {
  children: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disableLabelAlignmentFix?: boolean;
  noIcons?: boolean;
}

const MenuItem = forwardRef((props: IMenuItem, ref: React.ForwardedRef<HTMLLIElement>) => {
  const theme = useTheme() as themeType;

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  return (
    <span data-tip={props['data-tip']}>
      <MenuItemComponent
        onClick={props.disabled ? undefined : props.onClick}
        onKeyDown={props.onKeyDown}
        theme={theme}
        color={props.color}
        colorShade={props.colorShade}
        tabIndex={-1}
        ref={ref}
        noEffect={props.disabled || props.noEffect}
        height={props.height}
        disabled={props.disabled}
        data-tip={props['data-tip']}
      >
        {props.noIcons ? null : <IconStyleWrapper>{props.icon ? props.icon : null}</IconStyleWrapper>}
        <span style={{ marginBottom: props.disableLabelAlignmentFix ? 0 : 1 }}>{props.children}</span>
      </MenuItemComponent>
    </span>
  );
});

export { MenuItem };
