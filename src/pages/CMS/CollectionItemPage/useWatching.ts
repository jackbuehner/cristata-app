import { useMemo } from 'react';
import { get as getProperty } from 'object-path';
import { CmsItemState } from '../../../redux/slices/cmsItemSlice';
import { AuthUserState } from '../../../redux/slices/authUserSlice';

interface UseWatchingParams {
  authUserState: AuthUserState;
  mandatoryWatchersKeys: string[];
  itemStateFields: CmsItemState['fields'];
}

interface UseWatchingReturn {
  isWatching?: boolean;
  isMandatoryWatcher?: boolean;
  mandatoryWatchersList: string;
}

function useWatching(params: UseWatchingParams): UseWatchingReturn {
  return useMemo<UseWatchingReturn>(() => {
    const watchers: string[] = (
      (getProperty(params.itemStateFields, 'people.watching') as { _id: string }[]) || []
    ).map(({ _id }) => _id);

    const mandatoryWatchers = ([] as { _id: string }[]).concat
      .apply(
        [],
        params.mandatoryWatchersKeys.map(
          (key): { _id: string }[] => getProperty(params.itemStateFields, key) || []
        )
      )
      .map(({ _id }) => _id);

    const isWatching: boolean | undefined =
      params.authUserState && watchers?.includes(params.authUserState._id);
    const isMandatoryWatcher: boolean | undefined =
      params.authUserState && mandatoryWatchers?.includes(params.authUserState._id);

    return { isWatching, isMandatoryWatcher, mandatoryWatchersList: params.mandatoryWatchersKeys.join(', ') };
  }, [params.itemStateFields, params.mandatoryWatchersKeys, params.authUserState]);
}

export { useWatching };