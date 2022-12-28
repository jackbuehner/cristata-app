import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';
import { useTheme } from '@emotion/react';

interface SectionHeadingProps {
  icon?: React.ReactElement;
  children: React.ReactNode;
}

function SectionHeading(props: SectionHeadingProps) {
  const theme = useTheme() as themeType;

  return (
    <SectionHeadingComponent theme={theme}>
      {props.icon ? props.icon : null}
      {props.children}
    </SectionHeadingComponent>
  );
}

const SectionHeadingComponent = styled.h2<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0 0 16px 0;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  position: sticky;
  left: 0;
`;

export { SectionHeading };
