import useAxios from 'axios-hooks';
import { SideNavSubButton } from '../../../components/Button';
import { TaskListLtr20Regular } from '@fluentui/react-icons';
import { APIProject } from '../../../interfaces/github/plans';

function PlansSideNavSub() {
  const [{ data, loading, error }] = useAxios<APIProject[]>('/gh/org/projects');

  if (loading) return <span>Loading...</span>;
  if (error) {
    console.error(error);
    return <span>Error: {error.code}</span>;
  }
  if (data) {
    return (
      <>
        {data.map((project, index: number) => {
          return (
            <SideNavSubButton key={index} Icon={<TaskListLtr20Regular />} to={`/plans/org/${project.id}`}>
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
