/* eslint-disable react-hooks/rules-of-hooks */
import { ApolloClient, gql, useMutation } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { get as getProperty } from 'object-path';
import { useState } from 'react';
import { toast } from 'react-toastify';
import utils from '../../../components/CollaborativeFields/utils';
import { DateTime, Text } from '../../../components/ContentField';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { useWindowModal } from '../../../hooks/useWindowModal';
import { themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';

function usePublishModal(
  y: EntryY,
  client: ApolloClient<object>,
  collectionName: string,
  itemId: string,
  publishStage?: number,
  idKey = '_id'
): [React.ReactNode, () => void, () => void] {
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const theme = useTheme() as themeType;

    const [confirm, setConfirm] = useState<string>('');
    const [timestamp, setTimestamp] = useState<string>(
      getProperty(y.data, 'timestamps.published_at') as string
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const PUBLISH_ITEM = gql`mutation {
      ${uncapitalize(collectionName)}Publish(${idKey || '_id'}: "${itemId}", published_at: "${
      timestamp || new Date().toISOString()
    }", publish: true) {
        timestamps {
          published_at
        }
      }
    }`;

    const [publishItem] = useMutation(PUBLISH_ITEM);

    const shortId = itemId.slice(-6);

    return {
      title: `Publish article`,
      isLoading: isLoading,
      continueButton: {
        text: 'Publish',
        onClick: async () => {
          setIsLoading(true);

          if (publishStage) {
            const isPublished = !!(await publishItem()).data;

            try {
              if (y.ydoc) {
                new utils.shared.Float(y.ydoc).set('stage', publishStage);
              }
            } catch (error) {
              toast.warn('Could not set stage in syncronized state, but the document will still be published.');
              console.error(error);
            }

            try {
              if (y.ydoc) {
                new utils.shared.Date(y.ydoc).set('timestamps.published_at', timestamp);
              }
            } catch (error) {
              toast.warn(
                'Could not set publish time in syncronized state, but the document will still be published.'
              );
              console.error(error);
            }

            // return whether the action was successful
            setIsLoading(false);
            if (isPublished === true) {
              toast.success('Published document');
              return true;
            }
          }

          return false;
        },
        disabled: confirm !== shortId,
      },
      windowOptions: { name: 'publish cms item' },
      children: (
        <>
          <p style={{ marginTop: 0, fontSize: 13, color: theme.color.neutral[theme.mode][1100] }}>
            Before continuing, please <b>check the document and its metadata for formatting issues and typos</b>
            .
          </p>
          <p style={{ fontSize: 13, color: theme.color.neutral[theme.mode][1100] }}>
            Once you publish this document, it will be available for everyone to see. Only a few people will be
            able to unpublish this document.
          </p>
          <br />
          <DateTime
            label={'Choose publish date and time'}
            description={
              'This data can be any time in the past or future. Content will not appear until the date has occured.'
            }
            value={timestamp === '0001-01-01T01:00:00.000Z' ? null : timestamp}
            onChange={(date) => {
              if (date) setTimestamp(date.toUTC().toISO());
            }}
            placeholder={'Pick a time'}
            isEmbedded
          />
          <Text
            label={'Confirm publish'}
            description={`Publish article <code>${shortId}</code>`}
            placeholder={`Type "${shortId}" to publish the article`}
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            isEmbedded
          />
        </>
      ),
    };
  }, [client, collectionName, itemId, publishStage, idKey]);

  return [Window, showModal, hideModal];
}

export { usePublishModal };
