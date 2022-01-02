import { css, SerializedStyles, useTheme } from '@emotion/react';
import styled, { CSSObject } from '@emotion/styled/macro';
import { CircularProgress } from '@material-ui/core';
import { colorType, themeType } from '../../utils/theme/theme';

const Component = styled(CircularProgress)<{
  theme: themeType;
  col: colorType;
  size: number;
  style?: SerializedStyles;
}>`
  width: ${({ size }) => size}px !important;
  height: ${({ size }) => size}px !important;
  color: ${({ theme, col }) =>
    col === 'neutral' ? theme.color.neutral[theme.mode][100] : theme.color[col][900]} !important;
  ${({ style }) => style}
`;

interface ISpinner {
  size?: number;
  style?: CSSObject;
  color?: colorType;
}

function Spinner(props: ISpinner) {
  const theme = useTheme() as themeType;
  return (
    <Component theme={theme} col={props.color || 'primary'} size={props.size || 20} style={css(props.style)} />
  );
}

export { Spinner };
