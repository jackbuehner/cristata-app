/* eslint-disable react-hooks/rules-of-hooks */
import { get as getProperty } from '$utils/objectPath';
import type { ApolloClient } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { gql } from 'graphql-tag';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DateTime, Text } from '../../../components/ContentField';
import type { EntryY } from '../../../components/Tiptap/hooks/useY';
import type { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { useWindowModal } from '../../../hooks/useWindowModal';
import type { themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import type { RenderFields } from './CollectionItemPage';

interface UsePublishModal {
  y: EntryY;
  client: ApolloClient<object>;
  collectionName: string;
  itemId: string;
  publishStage?: number;
  idKey?: string;
  processSchemaDef: (
    schemaDef: DeconstructedSchemaDefType,
    isPublishModal?: boolean
  ) => DeconstructedSchemaDefType;
  renderFields: RenderFields;
  schemaDef: DeconstructedSchemaDefType;
}

function usePublishModal(params: UsePublishModal): [React.ReactNode, () => void, () => void] {
  let { y, client, collectionName, itemId, idKey, processSchemaDef, renderFields, schemaDef } = params;

  if (!idKey) idKey = '_id';

  const [Window, showModal, hideModal] = useWindowModal(() => {
    const theme = useTheme() as themeType;

    const [confirm, setConfirm] = useState<string>('');

    const [timestamp, setTimestamp] = useState<string | undefined>();
    useEffect(
      () => {
        if (!timestamp) {
          setTimestamp(getProperty(y.data, 'timestamps.published_at') as string | undefined);
        }
      },
      // `y.data` ACTUALLY WILL rerender the component when it changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [timestamp, y.data]
    );

    const [timestampU, setTimestampU] = useState<string | undefined>();

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
      title: `Publish document`,
      isLoading: isLoading,
      continueButton: {
        text: 'Publish',
        onClick: async () => {
          setIsLoading(true);

          const isPublished = !!(await publishItem()).data;
          setIsLoading(false);

          // return whether the action was successful
          if (isPublished === true) {
            toast.success('Published document');
            return true;
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
          {processSchemaDef(schemaDef, true).map((elem, index, arr) =>
            renderFields(elem, index, arr, undefined, undefined, true)
          )}
          <DateTime
            label={'Choose publish date and time'}
            description={
              'This data can be any time in the past or future. Content will not appear until the date has occured.'
            }
            value={timestamp === '0001-01-01T01:00:00.000Z' ? null : timestamp || null}
            onChange={(date) => {
              if (date) setTimestamp(date.toUTC().toISO());
            }}
            placeholder={'Pick a time'}
            isEmbedded
          />
          {!!getProperty(y.data, 'timestamps.published_at') ? (
            <DateTime
              label={'Choose update date and time'}
              description={'Indicate that this document has been updated since its publish date.'}
              value={timestamp === '0001-01-01T01:00:00.000Z' ? null : timestampU || null}
              onChange={(date) => {
                if (date) setTimestamp(date.toUTC().toISO());
              }}
              placeholder={'Pick a time'}
              isEmbedded
            />
          ) : null}
          <Text
            label={'Confirm publish'}
            description={`Publish document <code>${shortId}</code>`}
            placeholder={`Type "${shortId}" to publish the document`}
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            isEmbedded
          />
        </>
      ),
    };
  }, [client, collectionName, itemId, idKey]);

  return [Window, showModal, hideModal];
}

export { usePublishModal };
