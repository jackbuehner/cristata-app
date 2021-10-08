import { Delete16Regular, Edit16Regular, Open16Regular } from '@fluentui/react-icons';
import { NodeViewWrapper, NodeViewProps, Node } from '@tiptap/react';
import IframeResizer from 'iframe-resizer-react';
import { useRef, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../Modal';
import { TextInput } from '../../TextInput';
import { WidgetWrapper, WidgetActions, WidgetLabel } from '../components/Widget';
import { SweepwidgetWidgetOptions } from './sweepwidgetWidget';

interface ISweepwidget extends NodeViewProps {
  extension: Node<SweepwidgetWidgetOptions>;
}

function Sweepwidget(props: ISweepwidget) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const [showEditModal, hideEditModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [idValue, setIdValue] = useState<HTMLTextAreaElement['value']>(props.node.attrs.id);

    /**
     * When the user types in the field, update `noteValue` in state
     */
    const handleIdFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIdValue(e.target.value);
    };

    return (
      <PlainModal
        hideModal={hideEditModal}
        title={`Change SweedpWidget ID`}
        continueButton={{
          text: 'Save',
          onClick: () => {
            props.updateAttributes({ id: idValue });
            return true;
          },
          disabled: idValue.length < 1,
        }}
      >
        <TextInput
          name={'edit-id'}
          id={'edit-id'}
          value={idValue}
          onChange={handleIdFieldChange}
          placeholder={`Type id...`}
        ></TextInput>
      </PlainModal>
    );
  }, [props.node.attrs.id]);

  return (
    <NodeViewWrapper>
      <WidgetWrapper
        ref={widgetRef}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseOut={() => setIsMouseOver(false)}
        contentEditable={false}
      >
        <IframeResizer
          autoResize={true}
          resizeFrom={'child'}
          checkOrigin={false}
          contentEditable={false}
          srcDoc={`
            <head>
              <script type="text/javascript" src="/scripts/iframeResizer.contentWindow.min.js"></script>
            </head>
            <body>
              <div id="${props.node.attrs.id}" class="sw_container"></div>
              <script type="text/javascript" src="https://sweepwidget.com/w/j/w_init.js"></script>
            </body>
          `}
          style={{ border: 'none', width: '100%', minWidth: '100%' }}
        />
        <WidgetLabel
          isVisible={isMouseOver}
          contentEditable={false}
          data-drag-handle
          draggable={props.extension.config.draggable ? true : false}
        >
          SweepWidget
        </WidgetLabel>
        <WidgetActions
          isVisible={isMouseOver}
          contentEditable={false}
          actions={[
            {
              icon: <Open16Regular />,
              label: 'Open giveaway landing page',
              onClick: () => window.open(`https://sweepwidget.com/view/${props.node.attrs.id}`),
            },
            {
              icon: <Edit16Regular />,
              label: 'Change giveaway ID',
              onClick: showEditModal,
            },
            {
              icon: <Delete16Regular />,
              label: 'Remove widget',
              onClick: props.deleteNode,
            },
          ]}
        ></WidgetActions>
      </WidgetWrapper>
    </NodeViewWrapper>
  );
}

export { Sweepwidget };
