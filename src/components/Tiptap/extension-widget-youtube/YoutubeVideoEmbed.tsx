import { useModal } from '@cristata/react-modal-hook';
import styled from '@emotion/styled';
import { Delete16Regular, Edit16Regular, Open16Regular, TextDescription20Regular } from '@fluentui/react-icons';
import { Node, NodeViewContent, NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useRef, useState } from 'react';
import { PlainModal } from '../../Modal';
import { TextInput } from '../../TextInput';
import { WidgetActions, WidgetLabel, WidgetWrapper } from '../components/Widget';
import { YoutubeWidgetOptions } from './youtubeWidget';

interface IYoutubeVideoEmbed extends NodeViewProps {
  extension: Node<YoutubeWidgetOptions>;
}

function YoutubeVideoEmbed(props: IYoutubeVideoEmbed) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const [showEditModal, hideEditModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [idValue, setIdValue] = useState<HTMLTextAreaElement['value']>(props.node.attrs.videoId);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [videoUrl, setVideoUrl] = useState<HTMLTextAreaElement['value']>(
      `https://www.youtube.com/watch?v=${props.node.attrs.videoId}`
    );

    /**
     * When the user types in the field, update `idValue` and `videoUrl` in state
     */
    const handleVideoUrlFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setVideoUrl(e.target.value);
        const { search } = new URL(e.target.value);
        const UrlSearch = new URLSearchParams(search);
        const videoId = UrlSearch.get('v');
        if (videoId) setIdValue(videoId);
        else setIdValue(props.node.attrs.videoId);
      } catch (error) {
        setIdValue(props.node.attrs.videoId);
      }
    };

    return (
      <PlainModal
        hideModal={hideEditModal}
        title={`Change video`}
        continueButton={{
          text: 'Save',
          onClick: () => {
            props.updateAttributes({ videoId: idValue });
            return true;
          },
          disabled: idValue.length < 1 || idValue === props.node.attrs.videoId || !props.editor.isEditable,
        }}
      >
        <TextInput
          name={'edit-video-url'}
          id={'edit-video-url'}
          value={videoUrl}
          onChange={handleVideoUrlFieldChange}
          placeholder={`Type video url...`}
        ></TextInput>
      </PlainModal>
    );
  }, [props.node.attrs.videoId]);

  return (
    <NodeViewWrapper contentEditable={false}>
      <WidgetWrapper
        ref={widgetRef}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseOut={() => setIsMouseOver(false)}
      >
        <iframe
          title={'YouTube video'}
          style={{ aspectRatio: '16/9', margin: '20px 0' }}
          width={'100%'}
          src={`https://www.youtube-nocookie.com/embed/${props.node.attrs.videoId}?modestbranding=1`}
          frameBorder={0}
          allow={'autoplay; encrypted-media'}
          allowFullScreen
        />
        <WidgetLabel isVisible={isMouseOver} data-drag-handle draggable={true}>
          YouTube
        </WidgetLabel>
        <WidgetActions
          isVisible={isMouseOver}
          actions={[
            {
              icon: <Open16Regular />,
              label: 'Open on YouTube',
              onClick: () => window.open(`https://youtube.com/watch?v=${props.node.attrs.videoId}`),
            },
            {
              active: props.node.attrs.showCaption,
              icon: <TextDescription20Regular />,
              label: 'Toggle caption',
              onClick: () => props.updateAttributes({ showCaption: !props.node.attrs.showCaption }),
              disabled: !props.editor.isEditable,
            },
            {
              icon: <Edit16Regular />,
              label: 'Change video settings',
              onClick: showEditModal,
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
        <EditableContent
          contentEditable={props.node.attrs.showCaption}
          show={props.node.attrs.showCaption}
          showPlaceholder={props.node.textContent.length === 0}
        />
      </WidgetWrapper>
    </NodeViewWrapper>
  );
}

const EditableContent = styled(NodeViewContent)<{ show: boolean; showPlaceholder: boolean }>`
  display: ${({ show }) => (show ? 'block' : 'none')};
  margin: -10px 0 10px 0;
  color: #666;
  font-size: 90%;
  text-align: center;

  // show placeholder message when empty
  > div::before {
    content: '${({ showPlaceholder }) => (showPlaceholder ? 'Type a caption...' : '')}';
    position: absolute;
    color: ${({ theme }) => theme.color.neutral[theme.mode][600]};
    pointer-events: none;
    height: 0;
    transform: translateX(-50%);
  }

  // hide focus outline on content inside document frame
  &:focus {
    outline: none;
  }
`;

export { YoutubeVideoEmbed };
