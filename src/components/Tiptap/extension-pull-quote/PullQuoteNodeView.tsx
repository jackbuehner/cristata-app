import styled from '@emotion/styled/macro';
import { AlignLeft20Regular, AlignRight20Regular, Delete16Regular } from '@fluentui/react-icons';
import { Node, NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useRef, useState } from 'react';
import { WidgetActions, WidgetLabel, WidgetWrapper } from '../components/Widget';
import { PullQuoteOptions } from './PullQuote';

interface IPullQuoteNodeView extends NodeViewProps {
  extension: Node<PullQuoteOptions>;
}

function PullQuoteNodeView(props: IPullQuoteNodeView) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { updateAttributes } = props;
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  return (
    <NodeViewWrapper contentEditable={false}>
      <WidgetWrapper
        position={props.node.attrs.position}
        ref={widgetRef}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseOut={() => setIsMouseOver(false)}
      >
        <WidgetLabel isVisible={isMouseOver} data-drag-handle draggable={true}>
          Pull Quote
        </WidgetLabel>
        <WidgetActions
          isVisible={isMouseOver}
          actions={[
            props.node.attrs.position === 'right'
              ? {
                  icon: <AlignLeft20Regular />,
                  label: 'Align left',
                  onClick: () => updateAttributes({ position: 'left' }),
                  disabled: !props.editor.isEditable,
                }
              : {
                  icon: <AlignRight20Regular />,
                  label: 'Align right',
                  onClick: () => updateAttributes({ position: 'right' }),
                  disabled: !props.editor.isEditable,
                },
            {
              icon: <Delete16Regular />,
              label: 'Remove widget',
              onClick: props.deleteNode,
              disabled: !props.editor.isEditable,
            },
          ]}
        />
        <ContentWrapper>
          <EditableContent contentEditable={true} />
        </ContentWrapper>
      </WidgetWrapper>
    </NodeViewWrapper>
  );
}

const EditableContent = styled(NodeViewContent)`
  display: inline-flex;
  font-size: 120%;
  font-weight: 400;
  text-align: center;
`;

const ContentWrapper = styled.div`
  display: block;
  text-align: center;
  line-height: 1.3;
  border-top: 2px solid black;
  border-bottom: 2px solid black;
  padding: 18px 0;
`;

export { PullQuoteNodeView };
