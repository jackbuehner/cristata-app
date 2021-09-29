import { ItemDetailsPage } from '../../../pages/CMS/ItemDetailsPage';

interface IDocPropertiesSidebar {
  flatData?: { [key: string]: string | string[] | number | number[] | boolean };
  setFlatData?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string | string[] | number | number[] | boolean;
    }>
  >;
}

function DocPropertiesSidebar(props: IDocPropertiesSidebar) {
  return <ItemDetailsPage isEmbedded flatData={props.flatData} setFlatData={props.setFlatData} />;
}

export { DocPropertiesSidebar };
