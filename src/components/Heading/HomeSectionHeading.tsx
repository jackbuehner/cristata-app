import styled from '@emotion/styled/macro';
import { themeType } from '../../utils/theme/theme';
import { useTheme } from '@emotion/react';

interface IHomeSectionHeading {
  icon?: React.ReactElement;
  children: React.ReactNode;
}

function HomeSectionHeading(props: IHomeSectionHeading) {
  const theme = useTheme() as themeType;

  return (
    <HomeSectionHeadingComponent theme={theme}>
      {props.icon ? props.icon : null}
      {props.children}
    </HomeSectionHeadingComponent>
  );
}

export { HomeSectionHeading };

const HomeSectionHeadingComponent = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  position: sticky;
  left: 0;
`;
