import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { themeType } from '../../../../utils/theme/theme';

const DividerWrapper = styled.span`
  display: inline-flex;
  height: 32px;
  align-items: center;
  padding: 4px;
`;

const Divider = styled.span<{ theme: themeType }>`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[400] : theme.color.neutral.dark[500]};
`;

function ToolbarDivider() {
  const theme = useTheme() as themeType;
  return (
    <DividerWrapper>
      <Divider theme={theme} />
    </DividerWrapper>
  );
}

export { ToolbarDivider };
