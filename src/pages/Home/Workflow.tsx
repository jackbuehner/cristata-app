import { useQuery } from '@apollo/client';
import {
  Checkmark24Regular,
  Clock24Regular,
  Document24Regular,
  Edit24Regular,
  MailInbox24Regular,
} from '@fluentui/react-icons';
import { useRef } from 'react';
// import FluentIcon from '../../components/FluentIcon';
import { STAGE_COUNTS, STAGE_COUNTS__TYPE } from '../../graphql/queries';
import { WorkflowStatusCard } from './WorkflowStatusCard';

function Workflow() {
  const renderCounter = useRef(0);

  // get the workflow stages for all collections
  const { data } = useQuery<STAGE_COUNTS__TYPE>(STAGE_COUNTS, {
    fetchPolicy: renderCounter.current === 0 ? 'cache-and-network' : 'cache-only',
  });

  const stages = data?.workflow || [];

  // return status cards
  renderCounter.current = renderCounter.current + 1;
  return (
    <>
      <WorkflowStatusCard
        icon={<Document24Regular />}
        color={'neutral'}
        count={stages.reduce((sum, stage) => (sum += stage.count), 0)}
        to={`/cms/workflow`}
      >
        All entries
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<Edit24Regular />}
        color={'indigo'}
        count={stages.find((stage) => stage._id === 1)?.count || 0}
        to={`/cms/workflow`}
      >
        Planning
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<Edit24Regular />}
        color={'orange'}
        count={stages.find((stage) => stage._id === 2)?.count || 0}
        to={`/cms/workflow`}
      >
        Drafts
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<MailInbox24Regular />}
        color={'red'}
        count={stages.find((stage) => stage._id === 3)?.count || 0}
        to={`/cms/workflow`}
      >
        In review
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<Clock24Regular />}
        color={'blue'}
        count={stages.find((stage) => stage._id === 4)?.count || 0}
        to={`/cms/workflow`}
      >
        Ready
      </WorkflowStatusCard>
      <WorkflowStatusCard
        icon={<Checkmark24Regular />}
        color={'green'}
        count={stages.find((stage) => stage._id === 5)?.count || 0}
        to={`/cms/articles/all`}
      >
        Published
      </WorkflowStatusCard>
    </>
  );
}

export { Workflow };
