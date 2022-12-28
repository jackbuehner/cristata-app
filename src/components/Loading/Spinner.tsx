import { css, SerializedStyles, useTheme } from '@emotion/react';
import styled, { CSSObject } from '@emotion/styled';
import { CircularProgress } from '@material-ui/core';
import { colorShade, colorType, themeType } from '../../utils/theme/theme';

const Component = styled(CircularProgress)<{
  theme: themeType;
  col: colorType;
  shade?: colorShade;
  size: number;
  style?: SerializedStyles;
}>`
  width: ${({ size }) => size}px !important;
  height: ${({ size }) => size}px !important;
  color: ${({ theme, col, shade }) =>
    col === 'neutral'
      ? theme.color.neutral[theme.mode][shade || 100]
      : theme.color[col][shade || 900]} !important;
  ${({ style }) => style}
`;

interface ISpinner {
  size?: number;
  style?: CSSObject;
  color?: colorType;
  colorShade?: colorShade;
}

function Spinner(props: ISpinner) {
  const theme = useTheme() as themeType;
  return (
    <Component
      theme={theme}
      col={props.color || 'primary'}
      shade={props.colorShade}
      size={props.size || 20}
      style={css(props.style)}
    />
  );
}

export { Spinner };
