import { toast } from 'react-toastify';
import { persistor } from '../../redux/store';
import { server } from '../../utils/constants';

function SignOut() {
  persistor.purge(); // clear persisted redux store

  fetch(`${server.location}/auth/clear`, {
    method: 'post',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-cache',
  })
    .catch(() => {
      toast.error('Failed to sign out');
    })
    .finally(() => {
      window.location.href = window.location.protocol + '//' + window.location.host + process.env.PUBLIC_URL;
    });

  return null;
}

export { SignOut };
