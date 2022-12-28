import styled from '@emotion/styled';
import Color from 'color';

const CardBox = styled.div<{ noVerticalMargin?: boolean; noPadding?: boolean }>`
  margin: ${({ noVerticalMargin }) => (noVerticalMargin ? 0 : 16)}px 0;
  padding: ${({ noPadding }) => `${noPadding ? 0 : 16}px`};
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
`;

export { CardBox };
