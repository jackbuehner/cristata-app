import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

const SideNavHeadingComponent = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  margin: 20px 10px 10px 10px;
`;

function SideNavHeading(props: { children: React.ReactNode }) {
  const theme = useTheme() as themeType;

  return <SideNavHeadingComponent theme={theme}>{props.children}</SideNavHeadingComponent>;
}

export { SideNavHeading };
