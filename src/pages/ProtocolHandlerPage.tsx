import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function ProtocolHandlerPage() {
  const location = useLocation();
  const history = useHistory();

  const search = new URLSearchParams(location.search);

  const encodedTargetLocation = search.get('url') || '';

  const targetLocation = decodeURIComponent(encodedTargetLocation).split('://')[1];

  useEffect(() => {
    history.replace(targetLocation);
  }, [history, targetLocation]);

  return (
    <p>
      redirecting to{' '}
      <a href={`${document.location.origin}/${targetLocation}`}>
        {document.location.origin}/{targetLocation}
      </a>
    </p>
  );
}

export { ProtocolHandlerPage };
