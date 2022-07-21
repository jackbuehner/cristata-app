import { useWindowModal } from '../../../../../hooks/useWindowModal';
import { EditSchemaDef } from './EditSchemaDef';

interface UseEditSchemaDefProps {
  label: string;
  id: string;
}

function useEditSchemaDef(props: UseEditSchemaDefProps): [React.ReactNode, () => void, () => void] {
  const [Window, showModal, hideModal] = useWindowModal(() => {
    return {
      title: `${props.label}`,
      windowOptions: { name: `editSchemaField_${props.label}`, width: 370, height: 560 },
      styleString: `height: 600px; display: flex; flex-direction: column; > div:first-of-type { padding: 0; }`,
      cancelButton: null,
      continueButton: { text: 'Close' },
      children: <EditSchemaDef id={props.id} />,
    };
  }, []);

  return [Window, showModal, hideModal];
}

export { useEditSchemaDef };
