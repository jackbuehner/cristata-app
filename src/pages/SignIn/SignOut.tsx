import { toast } from 'react-toastify';

function SignOut() {
  fetch(`${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/auth/clear`, {
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
