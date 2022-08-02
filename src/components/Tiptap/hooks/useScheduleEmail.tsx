/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import { useWindowModal } from '../../../hooks/useWindowModal';
import { useAppSelector } from '../../../redux/hooks';
import useAxios from 'axios-hooks';
import { Field } from '../../ContentField/Field';
import { Checkbox, DateTime, SelectOne, Text } from '../../ContentField';
import { useTheme } from '@emotion/react';
import { themeType } from '../../../utils/theme/theme';
import { Editor } from '@tiptap/react';
import { generateEmailHTML } from '../components/Backstage/downloadEmailHTML';
import { DateTime as Luxon } from 'luxon';
import { db } from '../../../utils/axios/db';
import { toast } from 'react-toastify';

function useScheduleEmailWindow(
  editor: Editor | null,
  iframehtmlstring: string
): [React.ReactNode, () => void, () => void] {
  const [Window, showModal, hideModal] = useWindowModal(() => {
    const cmsItemState = useAppSelector((state) => state.cmsItem);
    const authUserState = useAppSelector((state) => state.authUser);
    const theme = useTheme() as themeType;
    const isPublished = cmsItemState.fields.stage === 5.2;

    // get the available contact lists and display them for selection
    // before sending the email campaign
    const [{ data: contactLists }] = fetchContactLists();
    const [selectedLists, setSelectedLists] = useState<string[]>([]);

    // track loading state so there is a visiual indication when
    // something is happening
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // get the available sned and reply addresses
    const [{ data: accountEmails }] = fetchAccountSenders();
    const emailOptions = (accountEmails || []).map(({ email_address }) => ({
      value: email_address,
      label: email_address,
    }));
    type StringValue = { value: string; label: string };
    type NumberValue = { value: number; label: string };

    // sender email
    const [senderEmail, setSenderEmail] = useState<string | undefined>(undefined);
    const handleSenderEmailChange = (value: StringValue | NumberValue | null) => {
      setSenderEmail(value?.value?.toString());
    };

    // reply email
    const [replyEmail, setReplyEmail] = useState<string | undefined>(undefined);
    const handleReplyEmailChange = (value: StringValue | NumberValue | null) => {
      setReplyEmail(value?.value?.toString());
    };
    useEffect(() => {
      if (senderEmail && !replyEmail) {
        setReplyEmail(senderEmail);
      }
    }, [senderEmail, replyEmail]);

    // the date and time in which the
    const [timestamp, setTimestamp] = useState<string | null>(null);
    const handleTimestampChange = (date: Luxon | null) => {
      if (date) {
        setTimestamp(date.toISO());
      }
    };

    // email subject
    const defaultName = cmsItemState.fields.name;
    const [subject, setSubject] = useState(defaultName);
    const handleSubjectChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSubject(e.currentTarget.value);
    };

    // sender name
    const defaultSenderName = authUserState.name;
    const [senderName, setSenderName] = useState(defaultSenderName);
    const handleSenderNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSenderName(e.currentTarget.value);
    };

    let generatedHTML = '';
    if (editor) {
      generatedHTML = generateEmailHTML(
        editor,
        iframehtmlstring,
        `${subject} [${cmsItemState.fields._id.slice(-6)}]`
      );
    }

    return {
      title: `Schedule email`,
      isLoading: isLoading,
      continueButton: {
        text: 'Schedule send',
        onClick: async () => {
          if (isPublished && subject && senderName && senderEmail && replyEmail && selectedLists.length > 0) {
            return await sendEmail(
              subject,
              senderEmail,
              replyEmail,
              senderName,
              generatedHTML,
              selectedLists,
              timestamp
            )
              .finally(() => {
                setIsLoading(false);
              })
              .then(({ data }) => {
                toast.success('Email scheduled successfully. Click to open a report.', {
                  onClick: () => {
                    window.open(data.details);
                  },
                });
                return true;
              })
              .catch((error) => {
                console.error(error);
                toast.error(`Failed to schedule email: ${error.message}`);
                return false;
              });
          }
          return false;
        },
        disabled:
          !isPublished || !subject || !senderName || !senderEmail || !replyEmail || selectedLists.length === 0,
      },
      windowOptions: { name: 'send email', height: 800, width: 1080 },
      styleString: `width: calc(100% - 40px); > div:first-of-type { display: flex; padding: 0; > p { width: 100% } }`,
      children: (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
          <div
            style={{
              flexGrow: 1,
              flexShrink: 0,
              maxWidth: 360,
              height: '100%',
              overflow: 'auto',
              padding: '20px 24px',
              boxSizing: 'border-box',
              borderRight: `1px solid ${
                theme.mode === 'light'
                  ? theme.color.neutral[theme.mode][200]
                  : theme.color.neutral[theme.mode][300]
              }`,
            }}
          >
            <Text isEmbedded label={'Subject'} value={subject} onChange={handleSubjectChange} />
            <Text isEmbedded label={'Sender name'} value={senderName} onChange={handleSenderNameChange} />
            <SelectOne
              isEmbedded
              label={'Sender email'}
              options={emailOptions}
              type={'String'}
              value={senderEmail ? { value: senderEmail, label: senderEmail } : undefined}
              onChange={handleSenderEmailChange}
            />
            <SelectOne
              isEmbedded
              label={'Reply email'}
              options={emailOptions}
              type={'String'}
              value={replyEmail ? { value: replyEmail, label: replyEmail } : undefined}
              onChange={handleReplyEmailChange}
            />
            <Checkbox
              isEmbedded
              label={'Schedule this email for later'}
              checked={timestamp !== null}
              onChange={(e) => {
                if (e.currentTarget.checked) {
                  setTimestamp(new Date(new Date().getTime() + 3600000).toISOString());
                } else {
                  setTimestamp(null);
                }
              }}
            />
            {timestamp === null ? null : (
              <DateTime isEmbedded label={'Send email at'} value={timestamp} onChange={handleTimestampChange} />
            )}
            <Field isEmbedded label={'Select lists'}>
              <>
                {contactLists?.lists?.map((list) => {
                  return (
                    <Checkbox
                      isEmbedded
                      key={list.list_id}
                      label={(list.favorite ? '★ ' : '') + list.name}
                      checked={selectedLists.includes(list.list_id)}
                      onChange={(e) => {
                        if (e.currentTarget.checked) {
                          setSelectedLists([...selectedLists, list.list_id]);
                        } else {
                          const index = selectedLists.findIndex((id) => id === list.list_id);
                          setSelectedLists([
                            ...selectedLists.slice(0, index),
                            ...selectedLists.slice(index + 1),
                          ]);
                        }
                      }}
                      style={{ padding: '3px 0' }}
                    />
                  );
                })}
              </>
            </Field>
          </div>
          <div
            style={{
              flexGrow: 1,
              flexShrink: 0,
              height: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <iframe
              srcDoc={generatedHTML}
              title={`email-preview`}
              style={{
                height: '100%',
                width: '100%',
                border: 'none',
                backgroundColor: '#f7f7f7',
              }}
            ></iframe>
          </div>
        </div>
      ),
    };
  }, []);

  return [Window, showModal, hideModal];
}

function fetchContactLists() {
  type ContactListsResponse = {
    lists?: {
      list_id: string;
      name: string;
      description?: string;
      favorite?: boolean;
      created_at: string;
      updated_at: string;
      membership_count: number;
    }[];
    lists_count?: number;
    _links?: {
      next?: {
        href?: string;
      };
    };
  };

  return useAxios<ContactListsResponse>('/constant-contact/contact_lists');
}

function fetchAccountSenders() {
  type AccountSendersResponse = {
    email_address: string;
    email_id: number;
    confirm_status: 'CONFIRMED' | 'UNCONFIRMED';
    confirm_time: string;
    confirm_source_type: 'SITE_OWNER' | 'SUPPORT' | 'FORCEVERIFY' | 'PARTNER';
    roles: ('CONTACT' | 'BILLING' | 'JOURNALING' | 'REPLT_TO' | 'OTHER')[];
    pending_roles: ('CONTACT' | 'BILLING' | 'JOURNALING' | 'REPLT_TO' | 'OTHER')[];
  }[];

  return useAxios<AccountSendersResponse>('/constant-contact/account_emails?confirm_status=CONFIRMED');
}

async function sendEmail(
  subject: string,
  senderEmail: string,
  replyEmail: string,
  senderName: string,
  html: string,
  contactLists: string[],
  scheduleTimestamp: string | null
) {
  const utcNow = Luxon.fromJSDate(new Date()).setZone('utc').toFormat('yyyy-MM-dd HH:mm:ss');
  return db.post('/constant-contact/emails', {
    name: `${subject.slice(0, 56)} [${utcNow}]`,
    contact_list_ids: contactLists,
    scheduled_date: scheduleTimestamp || '0',
    email_campaign_activities: [
      {
        format_type: 5,
        from_email: senderEmail,
        reply_to_email: replyEmail,
        from_name: senderName,
        subject: subject,
        html_content: html + '[[trackingImage]]',
        preheader: '',
      },
    ],
  });
}

export { useScheduleEmailWindow };
