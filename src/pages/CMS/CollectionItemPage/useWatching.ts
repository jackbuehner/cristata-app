import { useMemo } from 'react';
import { get as getProperty } from 'object-path';
import { AuthUserState } from '../../../redux/slices/authUserSlice';

interface UseWatchingParams {
  authUserState: AuthUserState;
  mandatoryWatchersKeys: string[];
  itemStateFields: Record<string, unknown>;
}

interface UseWatchingReturn {
  isWatching?: boolean;
  isMandatoryWatcher?: boolean;
  mandatoryWatchersList: string;
}

function useWatching(params: UseWatchingParams): UseWatchingReturn {
  return useMemo<UseWatchingReturn>(() => {
    const watchers: string[] = (getProperty(params.itemStateFields, 'people.watching') as string[]) || [];

    const mandatoryWatchers = ([] as string[]).concat.apply(
      [],
      params.mandatoryWatchersKeys.map((key): string[] => getProperty(params.itemStateFields, key) || [])
    );

    const isWatching: boolean | undefined =
      params.authUserState && watchers?.includes(params.authUserState._id);
    const isMandatoryWatcher: boolean | undefined =
      params.authUserState && mandatoryWatchers?.includes(params.authUserState._id);

    return { isWatching, isMandatoryWatcher, mandatoryWatchersList: params.mandatoryWatchersKeys.join(', ') };
  }, [params.itemStateFields, params.mandatoryWatchersKeys, params.authUserState]);
}

export { useWatching };
