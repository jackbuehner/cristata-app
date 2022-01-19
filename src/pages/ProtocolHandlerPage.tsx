import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ProtocolHandlerPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const search = new URLSearchParams(location.search);

  const encodedTargetLocation = search.get('url') || '';

  const targetLocation = decodeURIComponent(encodedTargetLocation).split('://')[1];

  useEffect(() => {
    navigate(targetLocation, { replace: true });
  }, [navigate, targetLocation]);

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
