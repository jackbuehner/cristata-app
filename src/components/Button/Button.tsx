import React from 'react';
import styled from '@emotion/styled/macro';
import { SerializedStyles, useTheme } from '@emotion/react';
import { themeType, colorShade, colorType } from '../../utils/theme/theme';
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
  min-width: ${({ width }) => (width ? width : '80px')};
  width: ${({ width }) => (width ? width + 'px' : 'unset')};
  height: ${({ height }) => (height ? height : '30px')};
  padding: 0 10px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
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

const IconStyleWrapper = styled.span<{ theme: themeType }>`
  margin: 0 8px 0 -4px;
  width: 16px;
  height: 16px;
  > svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  }
`;

export interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  height?: string;
  width?: string;
  border?: {
    base?: string;
  };
  backgroundColor?: {
    base?: string;
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
}

const Button: React.FC<ButtonProps> = (props) => {
  const theme = useTheme() as themeType;

  return (
    <BUTTON
      onClick={props.onClick}
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
        <IconStyleWrapper theme={theme}>{props.icon}</IconStyleWrapper>
      ) : null}
      <span style={{ marginBottom: props.disableLabelAlignmentFix ? 0 : 1 }}>{props.children}</span>
    </BUTTON>
  );
};

export { Button };
