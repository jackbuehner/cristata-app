import { useApolloClient } from '@apollo/client';
import { persistor } from '../../redux/store';

function SignOut() {
  const client = useApolloClient();

  (async () => {
    await persistor.purge(); // clear persisted redux store
    await client.clearStore(); // clear persisted apollo data
    window.localStorage.removeItem('apollo-cache-persist'); // apollo doesn't always clear this

    // sign out
    const tenant = location.pathname.split('/')[1];
    window.location.href = `https://${import.meta.env.VITE_AUTH_BASE_URL}/${
      tenant || ''
    }/sign-out?return=${encodeURIComponent(window.location.origin + '/' + tenant)}`;
  })();

  return null;
}

export { SignOut };
