import { useEffect, useState } from 'react';
import { getNavigationConfig } from '../../config';
import { ReturnedMainNavItem, SubNavGroup } from '../../config/config';
import { useAppSelector } from '../../redux/hooks';

function useNavigationConfig(key: 'main'): [ReturnedMainNavItem[] | undefined];
function useNavigationConfig(key: string): [SubNavGroup[] | undefined];
function useNavigationConfig(key: string): [SubNavGroup[] | ReturnedMainNavItem[] | undefined] {
  const authUserState = useAppSelector((state) => state.authUser);

  const [config, storeConfig] = useState<SubNavGroup[] | ReturnedMainNavItem[] | undefined>();

  useEffect(() => {
    async function get() {
      const res = await getNavigationConfig(key, authUserState);
      storeConfig(res);
    }
    get();
  }, [authUserState, key]);

  return [config];
}

export { useNavigationConfig };
