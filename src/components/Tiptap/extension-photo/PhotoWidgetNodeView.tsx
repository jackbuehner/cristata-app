import { query } from '$graphql/query';
import { useModal } from '@cristata/react-modal-hook';
import styled from '@emotion/styled';
import { Delete16Regular, Edit16Regular, TextDescription20Regular } from '@fluentui/react-icons';
import type { Node, NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ClientConsumer } from '../../../graphql/client';
import type { PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE } from '../../../graphql/queries';
import { PHOTOS_BASIC_BY_REGEXNAME_OR_URL } from '../../../graphql/queries';
import { InputGroup } from '../../InputGroup';
import { Label } from '../../Label';
import { PlainModal } from '../../Modal';
import { Select } from '../../Select';
import { WidgetActions, WidgetLabel, WidgetWrapper } from '../components/Widget';
import type { PhotoWidgetOptions } from './PhotoWidget';

interface IPhotoWidgetNodeView extends NodeViewProps {
  extension: Node<PhotoWidgetOptions>;
}

function PhotoWidgetNodeView(props: IPhotoWidgetNodeView) {
  const { updateAttributes } = props;
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  // get the photo from the database using the photoId attribute
  useEffect(() => {
    query<PHOTOS_BASIC_BY_REGEXNAME_OR_URL__TYPE>({
      fetch,
      tenant: window.location.pathname.split('/')[1],
      query: PHOTOS_BASIC_BY_REGEXNAME_OR_URL(props.node.attrs.photoId),
      useCache: false,
    }).then((result) => {
      const photo = result?.data?.photos?.docs?.[0];

      // set the photo url and credit attributes
      if (photo && props.editor.isEditable) {
        if (photo.photo_url && photo.photo_url !== props.node.attrs.photoUrl) {
          updateAttributes({ photoUrl: photo.photo_url });
        }
        if (photo.people?.photo_created_by && photo.people.photo_created_by !== props.node.attrs.photoCredit) {
          updateAttributes({ photoCredit: photo.people.photo_created_by });
        }
      }
    });
  }, [props.node.attrs.photoId]);

  // insert photo widget
  const [showPhotoWidgetModal, hidePhotoWidgetModal] = useModal(() => {
    const [photoId, setPhotoId] = useState<string>(props.node.attrs.photoId);
    const [photoUrl, setPhotoUrl] = useState<string>(props.node.attrs.photoUrl);
    const [photoPos, setPhotoPos] = useState<string>(props.node.attrs.position);

    return (
      <PlainModal
        hideModal={hidePhotoWidgetModal}
        title={`Insert photo`}
        continueButton={{
          text: 'Insert',
          onClick: () => {
            updateAttributes({ photoId, photoUrl, position: photoPos });
            return true;
          },
          disabled: photoId.length < 1 || !props.editor.isEditable,
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
                      photoUrl: photo.photo_url,
                    }));

                    // return the options array
                    return options || [];
                  }}
                  async
                  val={photoId}
                  onChange={(valueObj) => {
                    if (valueObj) {
                      setPhotoId(valueObj.value);
                      setPhotoUrl(valueObj.photoUrl);
                    }
                  }}
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
    <NodeViewWrapper contentEditable={false}>
      <WidgetWrapper
        position={props.node.attrs.position}
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
          src={props.node.attrs.photoUrl + '?tr=w-600'}
          alt={''}
        />
        <WidgetLabel isVisible={isMouseOver} data-drag-handle draggable={true}>
          Photo
        </WidgetLabel>
        <WidgetActions
          isVisible={isMouseOver}
          actions={[
            {
              active: props.node.attrs.showCaption,
              icon: <TextDescription20Regular />,
              label: 'Toggle caption',
              onClick: () => updateAttributes({ showCaption: !props.node.attrs.showCaption }),
              disabled: !props.editor.isEditable,
            },
            {
              icon: <Edit16Regular />,
              label: 'Change photo',
              onClick: showPhotoWidgetModal,
              disabled: !props.editor.isEditable,
            },
            {
              icon: <Delete16Regular />,
              label: 'Remove widget',
              onClick: props.deleteNode,
              disabled: !props.editor.isEditable,
            },
          ]}
        ></WidgetActions>
        <Caption show={props.node.attrs.showCaption}>
          <EditableContent
            contentEditable={props.node.attrs.showCaption}
            show={props.node.attrs.showCaption}
            showPlaceholder={props.node.textContent.length === 0}
          />
          <Source>{props.node.attrs.photoCredit}</Source>
        </Caption>
      </WidgetWrapper>
    </NodeViewWrapper>
  );
}

const EditableContent = styled(NodeViewContent)<{ show?: boolean; showPlaceholder: boolean }>`
  display: ${({ show }) => (show ? 'inline-flex' : 'none')};
  color: #666;
  font-size: 90%;
  text-align: center;

  // show placeholder message when empty
  > div {
    width: ${({ showPlaceholder }) => (showPlaceholder ? '112px' : 'unset')};
  }
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

const Caption = styled.div<{ show?: boolean }>`
  display: block;
  text-align: ${({ show }) => (show === true ? 'center' : 'right')};
  margin: ${({ show }) => (show === true ? `-10px 0 10px 0` : `-20px 0 10px 0`)};
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
