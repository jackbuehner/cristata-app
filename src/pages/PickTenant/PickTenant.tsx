import { Dispatch, SetStateAction, useCallback, useEffect } from 'react';
import { server } from '../../utils/constants';

interface PickTenantProps {
  tenant: string;
  setTenant: Dispatch<SetStateAction<string>>;
}

function PickTenant(props: PickTenantProps) {
  const checkTenantExists = useCallback(async (tenant: string): Promise<void> => {
    const res = await fetch(`${server.location}/v3/${tenant}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { userPublic(_id: "000000000000000000000000") { _id } }` }),
    });

    if (res.status !== 200)
      throw new Error('This tenant does not exist. Ask your supervisor for the correct tenant name.');
  }, []);

  const login = () => {
    window.location.href = `https://${import.meta.env.VITE_AUTH_BASE_URL}`;
  };

  useEffect(() => {
    if (!props.tenant && window.location.pathname.length > 1) {
      const parts = window.location.pathname.split('/');
      const possibleTenant = parts[1];
      checkTenantExists(possibleTenant)
        .then(() => {
          props.setTenant(possibleTenant);
          localStorage.setItem('tenant', possibleTenant);
        })
        .catch(() => {
          login();
        });
    } else {
      login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on first mount

  return null;
}

export { PickTenant };
