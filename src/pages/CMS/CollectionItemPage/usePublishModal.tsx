/* eslint-disable react-hooks/rules-of-hooks */
import { gql, useMutation } from '@apollo/client';
import LuxonUtils from '@date-io/luxon';
import { useTheme } from '@emotion/react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { get as getProperty } from 'object-path';
import { useState } from 'react';
import { useModal } from 'react-modal-hook';
import { DateTime, Text } from '../../../components/ContentField';
import { PlainModal } from '../../../components/Modal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { saveChanges } from './saveChanges';

function usePublishModal(
  collectionName: string,
  itemId: string,
  refetch: () => void,
  publishStage?: number,
  idKey = '_id'
) {
  const [showModal, hideModal] = useModal(() => {
    const state = useAppSelector((state) => state.cmsItem);
    const dispatch = useAppDispatch();
    const theme = useTheme() as themeType;

    const [confirm, setConfirm] = useState<string>('');
    const [timestamp, setTimestamp] = useState<string>(
      getProperty(state.fields, 'timestamps.published_at') as string
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

    return (
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <PlainModal
          hideModal={hideModal}
          title={`Publish article`}
          continueButton={{
            text: 'Publish',
            onClick: async () => {
              setIsLoading(true);

              if (publishStage) {
                const isPublished = !!(await publishItem()).data;
                const isStageSet = await saveChanges(
                  collectionName,
                  itemId,
                  { dispatch, state, refetch },
                  {
                    stage: publishStage,
                  }
                );

                // return whether the action was successful
                setIsLoading(false);
                if (isStageSet === true && isPublished === true) return true;
              }

              return false;
            },
            disabled: confirm !== shortId,
          }}
          isLoading={isLoading}
        >
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
        </PlainModal>
      </MuiPickersUtilsProvider>
    );
  }, []);

  return [showModal, hideModal];
}

export { usePublishModal };