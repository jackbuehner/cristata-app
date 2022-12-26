import styled from '@emotion/styled/macro';

const CardLabelCaption = styled.div`
  line-height: 15px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1100]};
  margin: -12px 0 16px 0;
  user-select: none;
`;

export { CardLabelCaption };
