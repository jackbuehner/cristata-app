import { useQuery } from '@apollo/client';
import { useRef } from 'react';
import FluentIcon from '../../components/FluentIcon';
import { STAGE_COUNTS, STAGE_COUNTS__TYPE } from '../../graphql/queries';
import { WorkflowStatusCard } from './WorkflowStatusCard';

function Workflow() {
  const renderCounter = useRef(0);

  // get the workflow stages for all collections
  const { data: workflowStagesAll } = useQuery<STAGE_COUNTS__TYPE>(STAGE_COUNTS, {
    fetchPolicy: renderCounter.current === 0 ? 'cache-and-network' : 'cache-only',
  });

  // separate into key-value pairs
  const workflowStages = [].concat(...(Object.values({ ...workflowStagesAll }) as any)) as {
    _id: number;
    count: number;
  }[];

  // reduce stages to remove duplicates
  // (merge stage numbers from the different collections)
  const stages = workflowStages?.reduce((obj: { [key: number]: number }, item) => {
    if (item) return Object.assign(obj, { [item._id]: (obj[item._id] || 0) + item.count });
    return obj;
  }, {});

  // return status cards
  renderCounter.current = renderCounter.current + 1;
  return (
    <>
      <WorkflowStatusCard
        icon={<FluentIcon name={'Document24Regular'} />}
        color={'neutral'}
        count={
          (stages[1.1] || 0) +
          (stages[2.1] || 0) +
          (stages[3.1] || 0) +
          (stages[3.3] || 0) +
          (stages[3.5] || 0) +
          (stages[4.1] || 0) +
          (stages[5.1] || 0) +
          (stages[5.2] || 0)
        }
        to={`/cms/articles/in-progress`}
      >
        All entries
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<FluentIcon name={'Edit24Regular'} />}
        color={'indigo'}
        count={(stages[1.1] || 0) + (stages[2.1] || 0)}
        to={`/cms/articles/in-progress`}
      >
        Drafts
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<FluentIcon name={'MailInbox24Regular'} />}
        color={'red'}
        count={(stages[3.1] || 0) + (stages[3.3] || 0) + (stages[3.5] || 0)}
        to={`/cms/articles/in-progress`}
      >
        In review
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<FluentIcon name={'Clock24Regular'} />}
        color={'orange'}
        count={stages[4.1] || 0}
        to={`/cms/articles/in-progress`}
      >
        Ready
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<FluentIcon name={'Checkmark24Regular'} />}
        color={'green'}
        count={(stages[5.1] || 0) + (stages[5.2] || 0)}
        to={`/cms/articles/all`}
      >
        Published
      </WorkflowStatusCard>
    </>
  );
}

export { Workflow };
