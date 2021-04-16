import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

export const TextArea = styled.textarea<{ theme: themeType; font?: 'headline' | 'body' | 'detail' }>`
  padding: 8px;
  line-height: 1.2;
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][800]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.color.primary[800]} 0px 0px 0px 2px inset;
  }
`;
