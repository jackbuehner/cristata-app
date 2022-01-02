import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { CircularProgress } from '@material-ui/core';
import { themeType } from '../../utils/theme/theme';

const SideNavHeadingComponent = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  padding: 20px 10px 10px 10px;
  position: relative;
  &:first-child {
    border-bottom: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
    margin-bottom: 10px;
    position: sticky;
    top: 0;
    background: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
    z-index: 10;
    font-size: 20px;
    height: 48px;
    display: flex;
    align-items: flex-end;
  }
`;

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  right: 12px;
  position: absolute;
  font-family: ${({ theme }) => theme.color.primary[900]} !important;
`;

function SideNavHeading(props: { children: React.ReactNode; isLoading?: boolean }) {
  const theme = useTheme() as themeType;

  return (
    <SideNavHeadingComponent theme={theme}>
      {props.children}
      {props.isLoading ? <Spinner theme={theme} /> : null}
    </SideNavHeadingComponent>
  );
}

export { SideNavHeading };
