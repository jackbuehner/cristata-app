import { YProvider } from '$utils/YProvider';
import type { ApolloClient } from '@apollo/client';
import type { HocuspocusProvider } from '@hocuspocus/provider';
import { WebSocketStatus } from '@hocuspocus/provider';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import pluralize from 'pluralize';
import type { DependencyList } from 'react';
import { useEffect, useRef, useState } from 'react';
import type * as awarenessProtocol from 'y-protocols/awareness.js';
import type { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import type { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import type { GetYFieldsOptions } from '../../../pages/CMS/CollectionItemPage/getYFields';
import { getYFields } from '../../../pages/CMS/CollectionItemPage/getYFields';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { capitalize } from '../../../utils/capitalize';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { useAwareness } from './useAwareness';

import * as apolloRaw from '@apollo/client';
const { useApolloClient } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

function useY(
  { collection, id, versionDate, user, schemaDef }: UseYProps,
  deps: DependencyList = []
): UseYReturn {
  const [ydoc, setYdoc] = useState<Y.Doc>();
  const providerRef = useRef(new YProvider());
  const [webProvider, setWebProvider] = useState<WebrtcProvider>();
  const [wsProvider, setWsProvider] = useState<HocuspocusProvider>();
  const [, setSettingsMap] = useState<Y.Map<IYSettingsMap>>();
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));

  useEffect(() => {
    let mounted = true;
    const y = providerRef.current;

    const tenant = location.pathname.split('/')[1];
    const docName = versionDate
      ? `${tenant}.${collectionName}.${id}.${versionDate}`
      : `${tenant}.${collectionName}.${id}`;
    y.create(docName, user._id, __APP_VERSION__).then((data) => {
      if (mounted) {
        setYdoc(data.ydoc);
        setWebProvider(data.webProvider);
        setWsProvider(data.wsProvider);

        // create a setting map for this document (used to sync settings accross all editors)
        const settingsMap = ydoc?.getMap<IYSettingsMap>('__settings');
        settingsMap?.set('collection', collectionName);
        setSettingsMap(settingsMap);
      }
    });

    return () => {
      y.delete(docName);
      mounted = false;
    };
  }, [collection, id, ...deps]);

  const awareness = useAwareness({ provider: wsProvider, user }); // get list of who is editing the doc

  // consider synced once the websocket provider is connected
  // and the web provider awareness has propogated (at least one array value)
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (!synced && awareness.length > 0 && wsProvider?.status === WebSocketStatus.Connected) {
      setSynced(true);
    }
  }, [awareness, synced, wsProvider?.status, wsProvider?.synced, ydoc]);

  const [wsStatus, setWsStatus] = useState<WebSocketStatus>(wsProvider?.status || WebSocketStatus.Disconnected);
  useEffect(() => {
    const handle = ({ status }: { status: WebSocketStatus }) => {
      setWsStatus(status);
    };
    wsProvider?.on('status', handle);
    return () => {
      wsProvider?.off('status');
    };
  });

  // the web provider is connected when there is a room
  // and the web provider is set to be connected
  const rtcConnected = (webProvider?.room && webProvider.shouldConnect) || undefined;

  const __unsavedFields = ydoc?.getArray<string>('__unsavedFields');
  const [unsavedFields, setUnsavedFields] = useState(__unsavedFields?.toArray() || []);
  useEffect(() => {
    if (__unsavedFields) {
      const handleChange = () => {
        setUnsavedFields(__unsavedFields.toArray() || []);
      };
      __unsavedFields.observe(handleChange);
      return () => {
        __unsavedFields.unobserve(handleChange);
      };
    }
  });

  const client = useApolloClient();
  const dispatch = useAppDispatch();
  const setLoading = (loading: boolean) => {
    dispatch(setIsLoading(loading));
  };

  const retObj = {
    ydoc: ydoc,
    provider: webProvider,
    wsProvider: wsProvider,
    rtcConnected: rtcConnected,
    wsStatus: wsStatus,
    // hide awareness if ws provider is not connected
    awareness: synced ? awareness : [],
    synced: synced,
    unsavedFields: unsavedFields,
    data: {},
    fullData: {},
    roomDetails: { collection: collectionName, id },
    client,
    setLoading,
    async getData(opts?: GetYFieldsOptions) {
      if (schemaDef) {
        const res = await getYFields(this.ydoc, schemaDef, opts);
        res._id = id;
        return res;
      }
      return {};
    },
    setState(state: Uint8Array, revert?: boolean) {
      if (ydoc) {
        if (revert) {
          const tempdoc = new Y.Doc();
          Y.applyUpdate(tempdoc, state);

          // We cannot simply replace `ydoc` because we have to sync with other clients.
          // Replacing `ydoc` would be similar to doing `git reset --hard $SNAPSHOT && git push --force`.
          // Instead, we compute an "anti-operation" of all the changes made since that snapshot.
          // This ends up being similar to `git revert $SNAPSHOT..HEAD`.
          const currentStateVector = Y.encodeStateVector(ydoc);
          const remoteStateVector = Y.encodeStateVector(tempdoc);

          // create undo command encompassing all changes since taking snapshot
          const changesSinceRemote = Y.encodeStateAsUpdate(ydoc, remoteStateVector);
          const um = new Y.UndoManager(Array.from(tempdoc.share.values()));
          Y.applyUpdate(tempdoc, changesSinceRemote);
          um.undo(); // undo changes so `tempdoc` is the value of the remote doc, but it is newer and will overwrite unsaved changes

          // apply undo command to ydoc
          const revertChangesSinceRemote = Y.encodeStateAsUpdate(tempdoc, currentStateVector);
          Y.applyUpdate(ydoc, revertChangesSinceRemote);
        } else {
          Y.applyUpdate(ydoc, state);
        }
      }
    },
  };

  const [_sharedValues, _setSharedValues] = useState<[Record<string, unknown>, Record<string, unknown>]>([
    {},
    {},
  ]);
  const handleDocUpdate = AwesomeDebouncePromise(async () => {
    if (schemaDef) {
      const sharedValues = (await retObj.getData()) ?? {};
      const setSharedValuesInternal =
        (await retObj.getData({ retainReferenceObjects: true, keepJsonParsed: true })) ?? {};
      _setSharedValues([sharedValues, setSharedValuesInternal]);
    }
  }, 500);
  useEffect(() => {
    if (ydoc && schemaDef) {
      ydoc.on('update', handleDocUpdate);
      return () => {
        ydoc.off('update', handleDocUpdate);
      };
    }
  });

  const [sharedValues, sharedValuesInternal] = _sharedValues;
  return { ...retObj, data: sharedValues, fullData: sharedValuesInternal };
}

interface UseYProps {
  collection: string;
  id: string;
  user: ReturnType<typeof useAwareness>[0];
  versionDate?: string;
  schemaDef?: DeconstructedSchemaDefType;
}

interface IYSettingsMap {
  trackChanges?: boolean;
  collection: string;
}

type UseYReturn = EntryY;

interface EntryY {
  ydoc: Y.Doc | undefined;
  provider: WebrtcProvider | undefined;
  wsProvider: HocuspocusProvider | undefined;
  rtcConnected: boolean | undefined;
  wsStatus: WebSocketStatus;
  awareness: ReturnType<typeof useAwareness>;
  synced: boolean;
  unsavedFields: string[];
  data: Record<string, unknown>;
  fullData: Record<string, unknown>;
  roomDetails: { collection: string; id: string };
  client: ApolloClient<object>;
  setLoading: (loading: boolean) => void;
  getData: (opts?: GetYFieldsOptions) => any;
  setState: (state: Uint8Array, revert?: boolean) => void;
}

interface FieldY extends EntryY {
  field: string;
  user?: ReturnType<typeof useAwareness>[0];
}

type FakeProvider = { awareness: awarenessProtocol.Awareness; connected?: boolean };

export type { EntryY, FakeProvider, FieldY, IYSettingsMap };
export { useY };
