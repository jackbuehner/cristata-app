import useAxios from 'axios-hooks';
import { SideNavSubButton } from '../../../components/Button';
import { TaskListLtr20Regular } from '@fluentui/react-icons';
import { APIProject } from '../../../interfaces/github/plans';
import { useHistory } from 'react-router';
import { SideNavHeading } from '../../../components/Heading';
import { Dispatch, SetStateAction } from 'react';

interface IPlansSideNavSub {
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}

function PlansSideNavSub(props: IPlansSideNavSub) {
  const history = useHistory();
  const [{ data, loading, error }] = useAxios<APIProject[]>('/gh/org/projects');

  if (loading) return <SideNavHeading isLoading>Plans</SideNavHeading>;
  if (error) {
    console.error(error);
    return <span>Error: {error.code}</span>;
  }
  if (data) {
    // navigate to the first project in the navigation
    if (data[0]) {
      history.push(`/plans/org/${data[0].id}`);
    }
    return (
      <>
        <SideNavHeading>Plans</SideNavHeading>
        {data.map((project, index: number) => {
          return (
            <SideNavSubButton
              key={index}
              Icon={<TaskListLtr20Regular />}
              to={`/plans/org/${project.id}`}
              setIsNavVisibleM={props.setIsNavVisibleM}
            >
              {project.name}
            </SideNavSubButton>
          );
        })}
      </>
    );
  }
  return null;
}

export { PlansSideNavSub };
