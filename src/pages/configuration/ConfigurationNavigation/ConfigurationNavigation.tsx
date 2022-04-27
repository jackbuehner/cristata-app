import { SideNavSubButton } from '../../../components/Button';
import { SideNavHeading } from '../../../components/Heading';
import { useGetCollections } from './useGetCollections';

function ConfigurationNavigation() {
  const [collections] = useGetCollections();

  return (
    <>
      <SideNavHeading>Configure Cristata</SideNavHeading>
      <SideNavHeading>Schemas</SideNavHeading>
      {collections?.map(({ name }, index) => {
        return (
          <SideNavSubButton key={index} Icon={<></>} to={`/configuration/schema/${name}`}>
            {name}
          </SideNavSubButton>
        );
      })}
    </>
  );
}

export { ConfigurationNavigation };
