import type { SerializedStyles } from '@emotion/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { MouseEventHandler } from 'react';
import type { colorShade, colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from './buttonEffect';

interface StyledButtonProps extends ButtonProps {
  color: colorType;
  colorShade: colorShade;
  theme: themeType;
}

const BUTTON = styled.button<StyledButtonProps>`
  ${({ color, colorShade, theme, disabled, backgroundColor, border }) =>
    buttonEffect(color, colorShade, theme, disabled, backgroundColor, border)}
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  width: ${({ width }) => (width ? width : 'unset')};
  height: ${({ height }) => (height ? height : '30px')};
  border-radius: ${({ borderRadius, theme }) =>
    borderRadius?.base !== undefined ? borderRadius.base : theme.radius};
  color: ${({ theme, disabled }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1400]};
  ${({ disabled, borderRadius, color, colorShade, theme }) =>
    disabled
      ? ``
      : `
          &:hover,
          &:focus-visible {
            border-radius: ${borderRadius?.hover ? borderRadius.hover : theme.radius};
          }
          &:active {
            border-radius: ${borderRadius?.active ? borderRadius.active : theme.radius};
          }
        `}
  ${({ cssExtra }) => cssExtra}
  > span {
    display: contents;
  }
  svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme, disabled }) =>
      disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1400]};
    opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  }
`;

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAuxClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  height?: string;
  width?: string;
  border?: {
    base?: string;
    hover?: string;
    active?: string;
  };
  backgroundColor?: {
    base?: string;
    hover?: string;
    active?: string;
  };
  cssExtra?: SerializedStyles;
  borderRadius?: {
    base?: number;
    hover?: number;
    active?: number;
  };
  disabled?: boolean;
  color?: colorType;
  colorShade?: colorShade;
  icon: React.ReactElement;
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
  forcedThemeMode?: 'light' | 'dark';
}

const IconButton: React.FC<ButtonProps> = (props) => {
  let theme = useTheme() as themeType;
  if (props.forcedThemeMode) theme = { ...theme, mode: props.forcedThemeMode };

  return (
    <BUTTON
      {...props}
      onClick={props.onClick}
      onAuxClick={props.onAuxClick}
      height={props.height}
      width={props.width}
      border={props.border}
      backgroundColor={props.backgroundColor}
      borderRadius={props.borderRadius}
      cssExtra={props.cssExtra}
      disabled={props.disabled}
      color={props.color ? props.color : 'primary'}
      colorShade={props.colorShade ? props.colorShade : theme.mode === 'light' ? 700 : 300}
      theme={theme}
      icon={props.icon}
      className={props.className}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.icon}
    </BUTTON>
  );
};

export { IconButton };
