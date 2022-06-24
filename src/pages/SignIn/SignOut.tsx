import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { persistor } from '../../redux/store';
import { server } from '../../utils/constants';

function SignOut() {
  const client = useApolloClient();
  const navigate = useNavigate();

  fetch(`${server.location}/auth/clear`, {
    method: 'post',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
  })
    .then(async () => {
      await persistor.purge(); // clear persisted redux store
      await client.clearStore(); // clear persisted apollo data
      window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this
      return;
    })
    .catch(() => {
      toast.error('Failed to sign out');
    })
    .finally(() => {
      navigate('/sign-in?from=sign-out');
    });

  return null;
}

export { SignOut };
