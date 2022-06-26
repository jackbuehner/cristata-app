import { CenteredOfflineNotice } from './CenteredOfflineNotice';
import { SmallOfflineNotice } from './SmallOfflineNotice';

interface OfflineProps {
  variant: 'centered' | 'small';
}

function Offline(props: OfflineProps) {
  if (props.variant === 'centered') return <CenteredOfflineNotice />;
  return <SmallOfflineNotice />;
}

export { Offline };
