import { FetchPolicy } from '@apollo/client';
import { useEffect, useState } from 'react';

const useCacheWithExpiration = (expiration: number, key: string): FetchPolicy => {
  const [fetchPolicy, setFetchPolicy] = useState<FetchPolicy>('cache-only');

  useEffect(() => {
    if (!navigator.onLine) {
      setFetchPolicy('cache-first');
      return;
    }

    if (localStorage) {
      const lastFetchTimestamp = localStorage.getItem(key);
      const expirationTimestamp = new Date(new Date().getTime() - expiration).toISOString();

      // no previous fetch, so we need to get data from the server
      if (!lastFetchTimestamp) {
        setFetchPolicy('network-only');
        localStorage.setItem(key, new Date().toISOString());
        return;
      }

      // previous fetch is expired, so we need to get data from the server
      if (new Date(lastFetchTimestamp) < new Date(expirationTimestamp)) {
        setFetchPolicy('network-only');
        localStorage.setItem(key, new Date().toISOString());
        return;
      }

      setFetchPolicy('cache-first');
      return;
    }

    setFetchPolicy('network-only');
  }, [expiration, key]);

  return fetchPolicy;
};

export { useCacheWithExpiration };
