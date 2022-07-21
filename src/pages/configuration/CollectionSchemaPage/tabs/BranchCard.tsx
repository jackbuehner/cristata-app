import styled from '@emotion/styled/macro';
import Color from 'color';
import React, { useState } from 'react';
import { Button, buttonEffect } from '../../../../components/Button';
import { colorType } from '../../../../utils/theme/theme';
import { useCreateBranch } from '../hooks/schema-modals/useCreateBranch';
import { useCreateSchemaDef } from '../hooks/schema-modals/useCreateSchemaDef';

interface BranchCardProps {
  id: string;
  branches: { name: string; fields: React.ReactNode }[];
}

function BranchCard(props: BranchCardProps) {
  const [CreateBranchWindow, showCreateBranchWindow] = useCreateBranch({
    id: props.id,
    branches: props.branches,
  });
  const [currentBranch, setCurrentBranch] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [EditWindow, showEditWindow] = useCreateSchemaDef(
    { type: 'unknown', apiIdPrefix: `${props.id}.field.custom.${currentBranch}.fields` },
    [count]
  );

  return (
    <Card>
      {CreateBranchWindow}
      {EditWindow}
      <BranchList>
        <BranchListActions>
          <Button onClick={showCreateBranchWindow}>Create branch</Button>
        </BranchListActions>
        <div>
          {props.branches.map((branch, index) => {
            return (
              <BranchName
                color={'primary'}
                selected={index === currentBranch}
                onClick={() => setCurrentBranch(index)}
              >
                {branch.name}
              </BranchName>
            );
          })}
        </div>
      </BranchList>
      <BranchItems>
        {props.branches[currentBranch]?.fields}
        <BranchActions>
          <Button
            onClick={() => {
              setCount(count + 1);
              showEditWindow();
            }}
          >
            Add branch field
          </Button>
        </BranchActions>
      </BranchItems>
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
  display: grid;
  grid-template-columns: 200px 1fr;
`;

const BranchList = styled.div`
  display: flex;
  gap: 3px;
  flex-direction: column;
  align-items: flex-start;
  border-right: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  height: 100%;
  box-sizing: border-box;
  > div:nth-of-type(2) {
    padding: 8px 16px 16px 16px;
    box-sizing: border-box;
    width: 100%;
  }
`;

const BranchListActions = styled.div`
  display: flex;
  width: 100%;
  gap: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  padding: 8px 16px;
  box-sizing: border-box;
`;

const BranchName = styled.div<{ color: colorType; selected: boolean }>`
  ${({ color, theme, selected }) =>
    buttonEffect(
      color,
      theme.mode === 'light' ? 700 : 300,
      theme,
      false,
      { base: selected ? Color(theme.color.neutral[theme.mode][800]).alpha(0.12).string() : 'transparent' },
      { base: '1px solid transparent' }
    )}
  width: 100%;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius};
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme, selected }) =>
    selected ? theme.color.primary[theme.mode === 'light' ? 900 : 300] : theme.color.neutral[theme.mode][1400]};
`;

const BranchItems = styled.div`
  flex-grow: 1;
`;

const BranchActions = styled.div`
  display: flex;
  width: 100%;
  gap: 6px;
  border-top: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  padding: 16px 16px;
  box-sizing: border-box;
  justify-content: flex-end;
`;

export { BranchCard };
