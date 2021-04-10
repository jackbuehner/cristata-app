import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { colorType, themeType } from '../../utils/theme/theme';

interface IStyledChip {
  color: colorType;
  //colorShade: colorShade;
  theme: themeType;
}

const StyledChip = styled.span<IStyledChip>`
  background: ${({ theme, color }) =>
    color === 'neutral' ? 'transparent' : Color(theme.color[color][800]).alpha(0.05).string()};
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
        : Color(theme.color[color][800]).alpha(0.1).string()}
    0px 0px 0px 1.25px inset;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme, color }) =>
    color === 'neutral'
      ? Color(theme.color[color][theme.mode][1200]).string()
      : Color(theme.color[color][800]).string()};
`;

interface IChip {
  label: string;
  color?: colorType;
}

function Chip(props: IChip) {
  const theme = useTheme() as themeType;

  return (
    <StyledChip theme={theme} color={props.color ? props.color : 'neutral'}>
      {props.label}
    </StyledChip>
  );
}

export { Chip };
