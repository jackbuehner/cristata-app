import type { WorkflowCompleteQuery } from '$graphql/graphql';
import { notEmpty } from '$utils/notEmpty';
import styled from '@emotion/styled';
import { useEffect } from 'react';
import { Column } from './Column';

interface WorkflowPageProps {
  data: WorkflowCompleteQuery['workflow'];
}

function WorkflowPage(props: WorkflowPageProps) {
  return (
    <PageWrapper>
      <PlanWrapper columnCount={4}>
        <Column
          id={1}
          title={`Planning`}
          cards={props.data?.find((group) => group._id === 1)?.docs.filter(notEmpty) || []}
        />
        <Column
          id={2}
          title={`Draft`}
          cards={props.data?.find((group) => group._id === 2)?.docs.filter(notEmpty) || []}
        />
        <Column
          id={3}
          title={`In review`}
          cards={props.data?.find((group) => group._id === 3)?.docs.filter(notEmpty) || []}
        />
        <Column
          id={4}
          title={`Ready`}
          cards={props.data?.find((group) => group._id === 4)?.docs.filter(notEmpty) || []}
        />
      </PlanWrapper>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  padding: 0;
  overflow: auto;
  box-sizing: border-box;
  flex-grow: 1;
`;

const PlanWrapper = styled.div<{ columnCount: number }>`
  padding: 15px 20px 20px 20px;
  height: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${({ columnCount }) => `repeat(${columnCount}, 300px)`};
  gap: 10px;
  overflow: auto;
`;

export { WorkflowPage };
