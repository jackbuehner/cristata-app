import { Dispatch, Fragment, SetStateAction } from 'react';
import { SideNavSubButton } from '../../../components/Button';
import FluentIcon from '../../../components/FluentIcon';
import { SideNavHeading } from '../../../components/Heading';
import { Offline } from '../../../components/Offline';
import { useNavigationConfig } from '../../../hooks/useNavigationConfig';

interface CmsNavigationProps {
  setIsNavVisibleM: Dispatch<SetStateAction<boolean>>;
}

function CmsNavigation(props: CmsNavigationProps) {
  const [cmsNav] = useNavigationConfig('cms');

  if (!cmsNav && !navigator.onLine) {
    return <Offline variant={'small'} />;
  }

  return (
    <>
      <SideNavHeading className={'not-header'}>Content Management System</SideNavHeading>
      <SideNavSubButton
        Icon={<FluentIcon name={'DataUsage24Regular'} />}
        to={'/cms/workflow'}
        setIsNavVisibleM={props.setIsNavVisibleM}
      >
        Workflow
      </SideNavSubButton>
      {cmsNav?.map((group, index) => {
        return (
          <Fragment key={index}>
            {group.label === 'Collections' ? (
              <>
                <SideNavHeading className={'not-header'}>Files</SideNavHeading>
                {group.items
                  .filter((item) => item.label === 'Files' || item.label === 'Photo library')
                  .map((item, index) => {
                    return (
                      <SideNavSubButton
                        key={index}
                        Icon={
                          <FluentIcon
                            key={index}
                            name={
                              item.label === 'Files'
                                ? 'Folder24Regular'
                                : item.label === 'Photo library'
                                ? 'TabDesktopImage24Regular'
                                : item.icon
                            }
                          />
                        }
                        to={item.to}
                        setIsNavVisibleM={props.setIsNavVisibleM}
                      >
                        {item.label}
                      </SideNavSubButton>
                    );
                  })}
              </>
            ) : null}
            <SideNavHeading className={'not-header'}>{group.label}</SideNavHeading>
            {group.items
              .filter((item) => {
                if (group.label === 'Collections') {
                  return item.label !== 'Files' && item.label !== 'Photo library';
                }
                return true;
              })
              .map((item, index) => {
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
