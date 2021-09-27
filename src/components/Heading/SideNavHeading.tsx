import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { CircularProgress } from '@material-ui/core';
import { themeType } from '../../utils/theme/theme';

const SideNavHeadingComponent = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  margin: 20px 10px 10px 10px;
  position: relative;
`;

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  right: 0;
  position: absolute;
  font-family: ${({ theme }) => theme.color.primary[900]} !important;
`;

function SideNavHeading(props: {
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  const theme = useTheme() as themeType;

  return (
    <SideNavHeadingComponent theme={theme}>
      {props.children}
      {props.isLoading ? <Spinner theme={theme} /> : null}
    </SideNavHeadingComponent>
  );
}

export { SideNavHeading };
