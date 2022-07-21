import styled from '@emotion/styled/macro';
import Color from 'color';
import { useState } from 'react';
import { buttonEffect } from '../../../components/Button';
import { colorType } from '../../../utils/theme/theme';
import { icons } from './tabs/SchemaCard';
import { useCreateSchemaDef } from './hooks/schema-modals/useCreateSchemaDef';

interface SidebarSchemaCardProps {
  label: string;
  icon?: keyof typeof icons;
  onClick?: () => void;
}

function SidebarSchemaCard(props: SidebarSchemaCardProps) {
  const [count, setCount] = useState<number>(0);
  const [EditWindow, showEditWindow] = useCreateSchemaDef({ type: props.icon || 'unknown' }, [count]);

  return (
    <Card
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        } else {
          showEditWindow();
          setCount(count + 1);
        }
      }}
    >
      {EditWindow}
      <Icon color={icons[props.icon || 'unknown'].color}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          enable-background='new 0 0 24 24'
          height='24px'
          viewBox='0 0 24 24'
          width='24px'
          fill='currentColor'
        >
          {icons[props.icon || 'unknown'].path}
        </svg>
      </Icon>
      <Details>
        <Label>{props.label}</Label>
      </Details>
    </Card>
  );
}

const Card = styled.div`
  padding: 10px;
  margin: 6px 0 0 0;
  gap: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
  ${({ theme }) => buttonEffect('primary', theme.mode === 'light' ? 800 : 200, theme)};
`;

const Icon = styled.div<{ color: colorType }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][600]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]
    )
      .alpha(0.15)
      .string()};
  color: ${({ theme, color }) =>
    color === 'neutral'
      ? theme.color.neutral[theme.mode][900]
      : theme.color[color][theme.mode === 'light' ? 900 : 300]};
  border-radius: ${({ theme }) => theme.radius};
  flex-shrink: 0;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  flex-grow: 1;
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

export { SidebarSchemaCard };
