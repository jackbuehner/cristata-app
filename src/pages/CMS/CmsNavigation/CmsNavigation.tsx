import { Dispatch, Fragment, SetStateAction } from 'react';
import { SideNavSubButton } from '../../../components/Button';
import FluentIcon from '../../../components/FluentIcon';
import { SideNavHeading } from '../../../components/Heading';
import { useNavigationConfig } from '../../../hooks/useNavigationConfig';

interface CmsNavigationProps {
  setIsNavVisibleM: Dispatch<SetStateAction<boolean>>;
}

function CmsNavigation(props: CmsNavigationProps) {
  const [cmsNav] = useNavigationConfig('cms');

  return (
    <>
      {cmsNav?.map((group, index) => {
        return (
          <Fragment key={index}>
            <SideNavHeading className={'not-header'}>{group.label}</SideNavHeading>
            {group.items.map((item, index) => {
              return (
                <SideNavSubButton
                  key={index}
                  Icon={<FluentIcon key={index} name={item.icon} />}
                  to={item.to}
                  setIsNavVisibleM={props.setIsNavVisibleM}
                >
                  {item.label}
                </SideNavSubButton>
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}

export { CmsNavigation };
