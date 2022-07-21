import styled from '@emotion/styled/macro';
import Color from 'color';
import React, { useState } from 'react';
import { Button } from '../../../../components/Button';
import { useCreateSchemaDef } from '../hooks/schema-modals/useCreateSchemaDef';

interface DocArrayCardProps {
  id: string;
  children: React.ReactNode;
}

function DocArrayCard(props: DocArrayCardProps) {
  const [count, setCount] = useState<number>(0);
  const [EditWindow, showEditWindow] = useCreateSchemaDef({ type: 'unknown', apiIdPrefix: props.id }, [count]);

  return (
    <Card>
      {EditWindow}
      <Items>
        {props.children}
        <Actions>
          <Button
            onClick={() => {
              setCount(count + 1);
              showEditWindow();
            }}
          >
            Add document field
          </Button>
        </Actions>
      </Items>
    </Card>
  );
}

const Card = styled.div`
  margin: -17px 16px 16px 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
`;

const Items = styled.div`
  flex-grow: 1;
`;

const Actions = styled.div`
  display: flex;
  width: 100%;
  gap: 6px;
  border-top: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  padding: 16px 16px;
  box-sizing: border-box;
  justify-content: flex-end;
`;

export { DocArrayCard };
