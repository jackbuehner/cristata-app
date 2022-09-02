import { useApolloClient } from '@apollo/client';
import { persistor } from '../../redux/store';

function SignOut() {
  const client = useApolloClient();

  (async () => {
    await persistor.purge(); // clear persisted redux store
    await client.clearStore(); // clear persisted apollo data
    window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this

    // sign out
    const tenant = localStorage.getItem('tenant');
    window.location.href = `https://${process.env.REACT_APP_AUTH_BASE_URL}/${
      tenant || ''
    }/sign-out?return=${encodeURIComponent(window.location.origin + '/' + tenant)}`;
  })();

  return null;
}

export { SignOut };
