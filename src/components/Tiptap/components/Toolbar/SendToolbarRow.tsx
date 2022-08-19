import { MailTemplate24Regular, SendClock24Regular } from '@fluentui/react-icons';
import { Editor } from '@tiptap/react';
import { useAppSelector } from '../../../../redux/hooks';
import { server } from '../../../../utils/constants';
import { useScheduleEmailWindow } from '../../hooks/useScheduleEmail';
import { FieldY } from '../../hooks/useY';
import { downloadEmailHTML } from '../Backstage/downloadEmailHTML';
import { ToolbarRow } from './ToolbarRow';
import { ToolbarRowButton } from './ToolbarRowButton';

interface SendToolbarRowProps {
  editor: Editor | null;
  isActive: boolean;
  isDisabled: boolean;
  iframehtmlstring: string;
  y: FieldY;
}

function SendToolbarRow({ editor, isActive, ...props }: SendToolbarRowProps) {
  const authUserState = useAppSelector((state) => state.authUser);
  const isPublished = props.y.data.stage === 5.2;
  const [ScheduleEmailWindow, showScheduleEmailWindow] = useScheduleEmailWindow(
    editor,
    props.y,
    props.iframehtmlstring
  );

  const handleSendEmailClick = () => {
    if (
      !authUserState.constantcontact ||
      new Date(authUserState.constantcontact.expires_at - 1000 * 60 * 10) > new Date()
    ) {
      const child = window.open(`${server.location}/v3/constant-contact/authorize`);
      if (child) {
        child.onunload = () => {
          window.location.reload();
        };
      }
    } else {
      showScheduleEmailWindow();
    }
  };

  return (
    <ToolbarRow isActive={isActive}>
      <ToolbarRowButton
        onClick={() => {
          if (editor) downloadEmailHTML(editor, props.iframehtmlstring);
        }}
        isActive={false}
        icon={<MailTemplate24Regular />}
        disabled={props.isDisabled || !editor}
      >
        Export
      </ToolbarRowButton>
      <ToolbarRowButton
        onClick={handleSendEmailClick}
        isActive={false}
        icon={<SendClock24Regular />}
        disabled={props.isDisabled || !editor || !isPublished}
        data-tip={!isPublished ? 'You must publish this document before you can schedule an email' : undefined}
      >
        Schedule send
      </ToolbarRowButton>
      {ScheduleEmailWindow}
    </ToolbarRow>
  );
}

export { SendToolbarRow };
