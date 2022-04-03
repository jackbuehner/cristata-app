import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../../../utils/theme/theme';

const StatusbarComponenet = styled.div<{ theme: themeType }>`
  display: flex;
  flex-shrink: 0;
  position: relative;
  width: 100%;
  max-width: 100vw;
  padding: 0px 12px;
  height: 24px;
  border-top: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][theme.mode === 'light' ? 400 : 200]};
  box-sizing: border-box;
  overflow: hidden;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
`;

interface IStatusbar {
  children: React.ReactChild;
}

function Statusbar(props: IStatusbar) {
  const theme = useTheme() as themeType;
  return <StatusbarComponenet theme={theme}>{props.children}</StatusbarComponenet>;
}

export { Statusbar };
