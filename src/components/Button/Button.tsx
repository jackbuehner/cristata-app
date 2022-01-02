import React from 'react';
import styled from '@emotion/styled/macro';
import { SerializedStyles, useTheme } from '@emotion/react';
import { themeType, colorShade, colorType } from '../../utils/theme/theme';
import { buttonEffect } from './buttonEffect';
import { ChevronDown12Regular } from '@fluentui/react-icons';

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
  min-width: ${({ width }) =>
    width ? (typeof width === 'number' || width.indexOf('px') === -1 ? `${width}px` : width) : '80px'};
  width: ${({ width }) =>
    width ? (typeof width === 'number' || width.indexOf('px') === -1 ? `${width}px` : width) : 'unset'};
  height: ${({ height }) =>
    height ? (typeof height === 'number' || height.indexOf('px') === -1 ? `${height}px` : height) : '30px'};
  padding: 0 10px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ theme, disabled }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1400]};
  border-radius: ${({ borderRadius, theme }) =>
    borderRadius?.base !== undefined ? borderRadius.base : theme.radius};
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
`;

const IconStyleWrapper = styled.span<{ theme: themeType; disabled?: boolean; size?: number }>`
  margin: 0 8px 0 -4px;
  width: ${({ size }) => (size ? size : 16)}px;
  height: ${({ size }) => (size ? size : 16)}px;
  svg {
    width: ${({ size }) => (size ? size : 16)}px;
    height: ${({ size }) => (size ? size : 16)}px;
    fill: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
    opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  }
  span {
    display: flex;
  }
`;

const ChevronWrapper = styled.span<{ theme: themeType; disabled?: boolean; size?: number }>`
  margin: 0 -4px 0 8px;
  width: ${({ size }) => (size ? size : 12)}px;
  height: ${({ size }) => (size ? size : 12)}px;
  svg {
    width: ${({ size }) => (size ? size : 12)}px;
    height: ${({ size }) => (size ? size : 12)}px;
    fill: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
    opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  }
  span {
    display: flex;
  }
`;

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onAuxClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  height?: string | number;
  width?: string | number;
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
  children?: React.ReactNode;
  icon?: React.ReactElement;
  customIcon?: React.ReactElement;
  disableLabelAlignmentFix?: boolean;
  className?: string;
  showChevron?: boolean;
}

const Button: React.FC<ButtonProps> = (props) => {
  const theme = useTheme() as themeType;

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
      colorShade={props.colorShade ? props.colorShade : 700}
      theme={theme}
      className={props.className}
    >
      {props.customIcon ? (
        props.customIcon
      ) : props.icon ? (
        <IconStyleWrapper theme={theme} disabled={props.disabled} className={`IconStyleWrapper`}>
          {props.icon}
        </IconStyleWrapper>
      ) : null}
      <span style={{ marginBottom: props.disableLabelAlignmentFix ? 0 : 1 }}>{props.children}</span>
      {props.showChevron ? (
        <ChevronWrapper theme={theme} disabled={props.disabled} className={`ChevronWrapper`} size={12}>
          <ChevronDown12Regular />
        </ChevronWrapper>
      ) : null}
    </BUTTON>
  );
};

export { Button };
