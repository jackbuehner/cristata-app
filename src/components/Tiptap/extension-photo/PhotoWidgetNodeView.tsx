import { useQuery } from '@apollo/client';
import styled from '@emotion/styled/macro';
import { Delete16Regular, Edit16Regular, TextDescription20Regular } from '@fluentui/react-icons';
import { NodeViewWrapper, NodeViewProps, Node, NodeViewContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useModal } from 'react-modal-hook';
import { ClientConsumer } from '../../../graphql/client';
import {
  PHOTOS_BASIC_BY_REGEXNAME_OR_URL,
  PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE,
} from '../../../graphql/queries';
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
  const { updateAttributes } = props;
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  // get the photo from the database using the photoId attribute
  const PHOTO_QUERY = useQuery<PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE>(
    PHOTOS_BASIC_BY_REGEXNAME_OR_URL(props.node.attrs.photoId),
    {
      fetchPolicy: 'no-cache',
    }
  );
  const photo = PHOTO_QUERY.data?.photos.docs?.[0];

  console.log(props.node.attrs.photoId);

  // set the photo url and credit attributes
  useEffect(() => {
    if (photo) {
      if (photo.photo_url) updateAttributes({ photoUrl: photo.photo_url });
      if (photo.people?.photo_created_by) updateAttributes({ photoCredit: photo.people.photo_created_by });
    }
  }, [photo, updateAttributes]);

  // insert photo widget
  const [showPhotoWidgetModal, hidePhotoWidgetModal] = useModal(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [photoId, setPhotoId] = useState<HTMLTextAreaElement['value']>(props.node.attrs.photoId);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [photoPos, setPhotoPos] = useState<string>(props.node.attrs.position);

    return (
      <PlainModal
        hideModal={hidePhotoWidgetModal}
        title={`Insert photo`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            updateAttributes({ photoId: photoId, position: photoPos });
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
            <ClientConsumer>
              {(client) => (
                <Select
                  client={client}
                  loadOptions={async (inputValue: string) => {
                    // get the photos that best match the input value
                    const { data } = await client.query<PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE>({
                      query: PHOTOS_BASIC_BY_REGEXNAME_OR_URL(inputValue),
                      fetchPolicy: 'no-cache',
                    });

                    // with the photo data, create the options array
                    const options = data?.photos.docs.map((photo) => ({
                      value: photo._id,
                      label: photo.name,
                    }));

                    // return the options array
                    return options || [];
                  }}
                  async
                  val={photoId}
                  onChange={(valueObj) => (valueObj ? setPhotoId(valueObj.value) : null)}
                />
              )}
            </ClientConsumer>
          </InputGroup>
        </ErrorBoundary>
        <ErrorBoundary fallback={<div>Error loading photo position field</div>}>
          <InputGroup type={`text`}>
            <Label
              description={`Choose whether the photo is right aligned, left aligned, or full width. On small devices, photos will always be full width.`}
            >
              Select photo position
            </Label>
            <ClientConsumer>
              {(client) => (
                <Select
                  client={client}
                  options={[
                    { label: 'Left-aligned', value: 'left' },
                    { label: 'Right-aligned', value: 'right' },
                    { label: 'Full width', value: 'center' },
                  ]}
                  val={photoPos}
                  onChange={(valueObj) => (valueObj ? setPhotoPos(valueObj.value) : null)}
                />
              )}
            </ClientConsumer>
          </InputGroup>
        </ErrorBoundary>
      </PlainModal>
    );
  }, [props.node.attrs.photoId, props.node.attrs.position]);

  return (
    <NodeViewWrapper>
      <WidgetWrapper
        position={props.node.attrs.position}
        ref={widgetRef}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseOut={() => setIsMouseOver(false)}
      >
        <img
          style={{
            margin:
              props.node.attrs.position === 'left' || props.node.attrs.position === 'right'
                ? '0 0 20px 0'
                : '20px 0',
          }}
          contentEditable={false}
          src={photo?.photo_url}
          alt={''}
        />
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
              onClick: () => updateAttributes({ showCaption: !props.node.attrs.showCaption }),
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
        <Caption show={props.node.attrs.showCaption?.toString()}>
          <EditableContent show={props.node.attrs.showCaption?.toString()} />
          <Source contentEditable={false}>{photo?.people.photo_created_by}</Source>
        </Caption>
      </WidgetWrapper>
    </NodeViewWrapper>
  );
}

const EditableContent = styled(NodeViewContent)<{ show: string }>`
  display: ${({ show }) => (show === 'true' ? 'inline-block' : 'none')};
  color: #666;
  font-size: 90%;
  text-align: center;
`;

const Caption = styled.div<{ show: string }>`
  display: block;
  text-align: ${({ show }) => (show === 'true' ? 'center' : 'right')};
  margin: ${({ show }) => (show === 'true' ? `-10px 0 10px 0` : `-26px 0 10px 0`)};
  line-height: 1.3;
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
