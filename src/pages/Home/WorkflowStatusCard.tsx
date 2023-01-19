import React from 'react';
import styled from '@emotion/styled';
import Color from 'color';
import { colorType, themeType } from '../../utils/theme/theme';
import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

interface IWorkflowStatusCard {
  color: colorType;
  icon: React.ReactElement;
  children: React.ReactNode;
  count: number;
  to?: string;
}

function WorkflowStatusCard(props: IWorkflowStatusCard) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const tenant = location.pathname.split('/')[1];

  return (
    <WorkflowStatusCardContainer
      theme={theme}
      color={props.color}
      onClick={() => {
        if (props.to) navigate(`/${tenant}${props.to}`);
      }}
    >
      <IconWrapper>{props.icon}</IconWrapper>
      <Caption theme={theme} color={props.color}>
        {props.children}
      </Caption>
      <Number theme={theme}>{props.count}</Number>
    </WorkflowStatusCardContainer>
  );
}

const WorkflowStatusCardContainer = styled.div<{ theme: themeType; color: colorType }>`
  background: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][600]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]
    )
      .alpha(0.15)
      .string()};
  display: inline-flex;
  flex-direction: column;
  width: 136px;
  height: 96px;
  align-items: flex-start;
  justify-content: left;
  padding: 10px;
  margin: 16px 16px 0 0;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${({ theme, color }) =>
      color === 'neutral'
        ? theme.color.neutral[theme.mode][900]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]}
    0px 0px 0px 1.25px inset;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme, color }) =>
    color === 'neutral'
      ? theme.color.neutral[theme.mode][900]
      : theme.color[color][theme.mode === 'light' ? 900 : 300]};
  transition: all 200ms ease 0s;
  cursor: default;
  user-select: none;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  &:hover,
  &:focus {
    background: ${({ theme, color }) =>
      Color(
        color === 'neutral'
          ? theme.color.neutral[theme.mode][600]
          : theme.color[color][theme.mode === 'light' ? 900 : 300]
      )
        .alpha(0.2)
        .string()};
    box-shadow: ${({ theme, color }) =>
        color === 'neutral'
          ? theme.color.neutral[theme.mode][800]
          : theme.color[color][theme.mode === 'light' ? 800 : 300]}
      0px 0px 0px 1.25px inset;
  }
  &:active {
    background: ${({ theme, color }) =>
      Color(
        color === 'neutral'
          ? theme.color.neutral[theme.mode][600]
          : theme.color[color][theme.mode === 'light' ? 900 : 300]
      )
        .alpha(0.3)
        .string()};
    box-shadow: ${({ theme, color }) =>
        color === 'neutral'
          ? theme.color.neutral[theme.mode][800]
          : theme.color[color][theme.mode === 'light' ? 800 : 300]}
      0px 0px 0px 1.25px inset;
  }
  @media (max-width: 1200px) {
    width: 110px;
    height: 80px;
    margin: 10px 10px 0 0;
    padding: 10px;
  }
  @media (max-width: 1000px) {
    width: calc(50% - 30px);
  }
`;

const IconWrapper = styled.span`
  > svg {
    height: 32px;
    margin-bottom: 10px;
    fill: currentColor;
    @media (max-width: 1200px) {
      margin-bottom: 2px;
      margin-top: -2px;
    }
  }
`;

const Caption = styled.span<{ theme: themeType; color: colorType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][1200]
        : theme.color[color][theme.mode === 'light' ? 1400 : 100]
    )
      .alpha(0.85)
      .string()};
`;

const Number = styled.span<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 20px;
  font-weight: 500;
  line-height: 1.25;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
`;

export { WorkflowStatusCard };
