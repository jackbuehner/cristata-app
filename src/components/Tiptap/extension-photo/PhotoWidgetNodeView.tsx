import styled from '@emotion/styled/macro';
import { Delete16Regular, Edit16Regular, TextDescription20Regular } from '@fluentui/react-icons';
import { NodeViewWrapper, NodeViewProps, Node, NodeViewContent } from '@tiptap/react';
import useAxios from 'axios-hooks';
import { useMemo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useModal } from 'react-modal-hook';
import { IPhoto } from '../../../interfaces/cristata/photos';
import { db } from '../../../utils/axios/db';
import { InputGroup } from '../../InputGroup';
import { Label } from '../../Label';
import { PlainModal } from '../../Modal';
import { Select } from '../../Select';
import { WidgetWrapper, WidgetActions, WidgetLabel } from '../components/Widget';
import { PhotoWidgetOptions } from './PhotoWidget';

interface IPhotoWidgetNodeView extends NodeViewProps {
  extension: Node<PhotoWidgetOptions>;
}

function PhotoWidgetNodeView(props: IPhotoWidgetNodeView) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  // get the photo from the database using the photoId attribute
  const { photoId } = props.node.attrs;
  const [{ data: photos }] = useAxios<IPhoto[]>(`/photos`);
  const photo = useMemo<IPhoto | undefined>(
    () => photos?.find((photo) => photo._id === photoId),
    [photos, photoId]
  );

  // set the photo url and credit attributes
  if (photo) {
    if (photo.photo_url) props.updateAttributes({ photoUrl: photo.photo_url });
    if (photo.people?.photo_created_by) props.updateAttributes({ photoCredit: photo.people.photo_created_by });
  }

  // insert photo widget
  const [showPhotoWidgetModal, hidePhotoWidgetModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [photoId, setPhotoId] = useState<HTMLTextAreaElement['value']>(``);

    return (
      <PlainModal
        hideModal={hidePhotoWidgetModal}
        title={`Insert photo`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            props.updateAttributes({ photoId: photoId });
            return true;
          },
          disabled: photoId.length < 1,
        }}
      >
        <ErrorBoundary fallback={<div>Error loading async select field</div>}>
          <InputGroup type={`text`}>
            <Label
              description={`Select from photos uploaded to the photo library. Photos only appear if they have proper photo attribution.`}
            >
              Select photo
            </Label>
            <Select
              loadOptions={async (inputValue: string) => {
                // get all photos
                const { data: photos }: { data: IPhoto[] } = await db.get(`/photos`);

                // with the data, create the options array
                let options: Array<{ value: string; label: string }> = [];
                photos.forEach((photo) => {
                  if (photo.people?.photo_created_by) {
                    options.push({
                      value: photo._id,
                      label: photo.name || photo._id,
                    });
                  }
                });

                // filter the options based on `inputValue`
                const filteredOptions = options.filter((option) =>
                  option.label.toLowerCase().includes(inputValue.toLowerCase())
                );

                // return the filtered options
                return filteredOptions;
              }}
              async
              val={photoId}
              onChange={(valueObj) => (valueObj ? setPhotoId(valueObj.value) : null)}
            />
          </InputGroup>
        </ErrorBoundary>
      </PlainModal>
    );
  }, []);

  return (
    <NodeViewWrapper>
      <WidgetWrapper
        ref={widgetRef}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseOut={() => setIsMouseOver(false)}
      >
        <img style={{ margin: '20px 0' }} contentEditable={false} src={photo?.photo_url} alt={''} />
        <WidgetLabel
          isVisible={isMouseOver}
          contentEditable={false}
          data-drag-handle
          draggable={props.extension.config.draggable ? true : false}
        >
          Photo
        </WidgetLabel>
        <WidgetActions
          isVisible={isMouseOver}
          contentEditable={false}
          actions={[
            {
              active: props.node.attrs.showCaption,
              icon: <TextDescription20Regular />,
              label: 'Toggle caption',
              onClick: () => props.updateAttributes({ showCaption: !props.node.attrs.showCaption }),
            },
            {
              icon: <Edit16Regular />,
              label: 'Change photo',
              onClick: showPhotoWidgetModal,
            },
            {
              icon: <Delete16Regular />,
              label: 'Remove widget',
              onClick: props.deleteNode,
            },
          ]}
        ></WidgetActions>
        <Caption show={props.node.attrs.showCaption}>
          <EditableContent show={props.node.attrs.showCaption} />
          <Source contentEditable={false}>{photo?.people.photo_created_by}</Source>
        </Caption>
      </WidgetWrapper>
    </NodeViewWrapper>
  );
}

const EditableContent = styled(NodeViewContent)<{ show: boolean }>`
  display: ${({ show }) => (show ? 'inline-block' : 'none')};
  color: #666;
  font-size: 90%;
  text-align: center;
`;

const Caption = styled.div<{ show: boolean }>`
  display: block;
  text-align: ${({ show }) => (show ? 'center' : 'right')};
  margin: ${({ show }) => (show ? `-10px 0 10px 0` : `-26px 0 10px 0`)};
`;

const Source = styled.span`
  display: inline;
  margin-top: 4px;
  font-family: Georgia, Times, 'Times New Roman', serif;
  color: #a7a7a7;
  font-size: 13px;
  cursor: default;
  margin-left: 6px;
`;

export { PhotoWidgetNodeView };