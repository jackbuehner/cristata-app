import FluentIcon from '../../components/FluentIcon';
import { HomeSectionHeading } from '../../components/Heading';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import { ItemsRow } from './ItemsRow';

interface CollectionRowsProps {
  firstRowIndex: number;
}

function CollectionRows(props: CollectionRowsProps) {
  const [collectionRowsConfig] = useDashboardConfig('collectionRows');

  return (
    <>
      {collectionRowsConfig?.map((item, index: number) => {
        return (
          <div
            style={{
              gridArea: `row-${index + props.firstRowIndex}`,
              overflowX: 'auto',
              height: 'max-content',
            }}
            key={index}
          >
            <HomeSectionHeading icon={<FluentIcon name={item.header.icon} />}>
              {item.header.label}
            </HomeSectionHeading>
            <ItemsRow query={item.query} dataKeys={item.dataKeys} arrPath={item.arrPath} to={item.to} />
          </div>
        );
      })}
    </>
  );
}

export { CollectionRows };
