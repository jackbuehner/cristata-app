import { ItemDetailsPage } from '../../../pages/CMS/ItemDetailsPage';
import { flatDataType } from '../../../pages/CMS/ItemDetailsPage/ItemDetailsPage';

interface IDocPropertiesSidebar {
  flatData?: flatDataType;
  setFlatData?: React.Dispatch<React.SetStateAction<flatDataType>>;
  changedFlatData?: flatDataType;
  setChangedFlatData?: React.Dispatch<React.SetStateAction<flatDataType>>;
}

function DocPropertiesSidebar(props: IDocPropertiesSidebar) {
  return (
    <ItemDetailsPage
      isEmbedded
      flatData={props.flatData}
      setFlatData={props.setFlatData}
      changedFlatData={props.changedFlatData}
      setChangedFlatData={props.setChangedFlatData}
    />
  );
}

export { DocPropertiesSidebar };
