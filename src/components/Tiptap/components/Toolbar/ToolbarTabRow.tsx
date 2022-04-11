import styled from '@emotion/styled/macro';
import Color from 'color';
import { themeType } from '../../../../utils/theme/theme';

interface IToolbarTabRow {
  theme: themeType;
  width: number;
  compact?: boolean;
}

const ToolbarTabRow = styled.div<IToolbarTabRow>`
  background-color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.neutral.light[100]
      : Color(theme.color.neutral.dark[100]).lighten(0.5).string()};
  display: flex;
  justify-content: flex-start;
  white-space: nowrap;
  height: ${({ width, compact }) => (width < 450 && !compact ? 72 : 36)}px;
  flex-direction: ${({ width }) => (width < 450 ? 'column-reverse' : 'row')};
  position: relative;
`;

export { ToolbarTabRow };
