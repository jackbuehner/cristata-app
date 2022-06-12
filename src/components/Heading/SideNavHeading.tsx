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
  padding: 20px 20px 10px 20px;
  position: relative;
  box-sizing: border-box;
  &:first-of-type:not(.not-header) {
    border-bottom: 1px solid;
    border-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][300]).alpha(0.5).string()};
    margin-bottom: 10px;
    position: sticky;
    top: 0;
    background: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
    z-index: 10;
    font-size: 16px;
    font-family: ${({ theme }) => theme.font.headline};
    height: 48px;
    padding: 0 20px;
    display: flex;
    align-items: center;
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
  &.not-header:first-of-type {
    padding-top: 26px;
  }
`;

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  right: 12px;
  position: absolute;
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 900 : 300]} !important;
`;

interface SideNavHeadingProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

function SideNavHeading(props: SideNavHeadingProps) {
  const theme = useTheme() as themeType;

  return (
    <SideNavHeadingComponent theme={theme} className={props.className}>
      {props.children}
      {props.isLoading ? <Spinner theme={theme} /> : null}
    </SideNavHeadingComponent>
  );
}

export { SideNavHeading };
