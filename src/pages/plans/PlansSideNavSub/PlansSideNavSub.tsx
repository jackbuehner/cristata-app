import { useTheme } from '@emotion/react';
import { TaskListLtr20Regular } from '@fluentui/react-icons';
import useAxios from 'axios-hooks';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button, SideNavSubButton } from '../../../components/Button';
import { SideNavHeading } from '../../../components/Heading';
import { APIProject } from '../../../interfaces/github/plans';
import { themeType } from '../../../utils/theme/theme';

interface IPlansSideNavSub {
  setIsNavVisibleM?: Dispatch<SetStateAction<boolean>>;
}

function PlansSideNavSub(props: IPlansSideNavSub) {
  const navigate = useNavigate();
  const theme = useTheme() as themeType;
  const { pathname } = useLocation();
  const [{ data, loading, error }, refetch] = useAxios<APIProject[]>('/gh/org/projects');

  useEffect(() => {
    // navigate to the first project in the navigation
    if (data && data[0]) {
      if (pathname === '/plans') {
        navigate(`/plans/org/${data[0].id}`);
      }
    }
  }, [data, pathname, navigate]);

  if (loading) return <SideNavHeading isLoading>Plans</SideNavHeading>;
  if (error) {
    console.error(error);
    return (
      <>
        <SideNavHeading>Plans</SideNavHeading>
        <div style={{ fontFamily: theme.font.detail, padding: 10 }}>
          <div style={{ marginBottom: 10 }}>Error: {error.response?.data?.message || error.message}</div>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </>
    );
  }
  if (data) {
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
