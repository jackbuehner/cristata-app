import { MailTemplate24Regular, SendClock24Regular } from '@fluentui/react-icons';
import { Editor } from '@tiptap/react';
import { useAppSelector } from '../../../../redux/hooks';
import { useScheduleEmailWindow } from '../../hooks/useScheduleEmail';
import { downloadEmailHTML } from '../Backstage/downloadEmailHTML';
import { ToolbarRow } from './ToolbarRow';
import { ToolbarRowButton } from './ToolbarRowButton';

interface SendToolbarRowProps {
  editor: Editor | null;
  isActive: boolean;
  isDisabled: boolean;
  iframehtmlstring: string;
}

function SendToolbarRow({ editor, isActive, ...props }: SendToolbarRowProps) {
  const cmsItemState = useAppSelector((state) => state.cmsItem);
  const isPublished = cmsItemState.fields.stage === 5.2;
  const [ScheduleEmailWindow, showScheduleEmailWindow] = useScheduleEmailWindow(editor, props.iframehtmlstring);

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
        onClick={showScheduleEmailWindow}
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
