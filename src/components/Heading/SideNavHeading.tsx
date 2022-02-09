import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { CircularProgress } from '@material-ui/core';
import Color from 'color';
import { themeType } from '../../utils/theme/theme';

const SideNavHeadingComponent = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 20px 10px 10px 10px;
  position: relative;
  &:first-of-type {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][300]).alpha(0.5).string()};
    margin-bottom: 10px;
    position: sticky;
    top: 0;
    background: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
    z-index: 10;
    font-size: 20px;
    height: 48px;
    display: flex;
    align-items: flex-end;
    flex-shrink: 0;

    /* blurred/acrylic background if supported */
    @supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0)) {
      background: ${({ theme }) =>
        Color(theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])
          .alpha(0.5)
          .string()};
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      background-blend-mode: exclusion;
    }
  }
`;

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  right: 12px;
  position: absolute;
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 900 : 300]} !important;
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
