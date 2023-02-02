import { useTheme, type SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import type { colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button/buttonEffect';

interface IStyledChip {
  color: colorType;
  //colorShade: colorShade;
  theme: themeType;
  isClickable: boolean;
  cssExtra?: SerializedStyles;
}

const StyledChip = styled.span<IStyledChip>`
  ${({ color, theme, isClickable }) =>
    isClickable ? buttonEffect(color, theme.mode === 'light' ? 800 : 200, theme) : null};
  border: none !important;
  background: ${({ theme, color }) =>
    color === 'neutral'
      ? 'transparent'
      : Color(theme.color[color][theme.mode === 'light' ? 800 : 300])
          .alpha(0.05)
          .string()};
  display: inline-flex;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  padding: 0 0.375rem;
  margin: 2px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  display: inline-flex;
  box-shadow: ${({ theme, color }) =>
      color === 'neutral'
        ? Color(theme.color[color][theme.mode][1200]).alpha(0.25).string()
        : Color(theme.color[color][theme.mode === 'light' ? 800 : 300])
            .alpha(0.1)
            .string()}
    0px 0px 0px 1.25px inset !important;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme, color }) =>
    color === 'neutral'
      ? Color(theme.color[color][theme.mode][1200]).string()
      : Color(theme.color[color][theme.mode === 'light' ? 800 : 300]).string()};
  ${({ cssExtra }) => (cssExtra ? cssExtra : null)};
`;

interface IChip {
  label: string;
  color?: colorType;
  onClick?: () => void;
  cssExtra?: SerializedStyles;
}

function Chip(props: IChip) {
  const theme = useTheme() as themeType;

  return (
    <StyledChip
      onClick={props.onClick}
      theme={theme}
      color={props.color ? props.color : 'neutral'}
      isClickable={props.onClick ? true : false}
      cssExtra={props.cssExtra}
    >
      {props.label}
    </StyledChip>
  );
}

export { Chip };
