import { ApolloClient, useApolloClient } from '@apollo/client';
import { HocuspocusProvider, WebSocketStatus } from '@hocuspocus/provider';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import pluralize from 'pluralize';
import { DependencyList, useEffect, useRef, useState } from 'react';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { getYFields, GetYFieldsOptions } from '../../../pages/CMS/CollectionItemPage/getYFields';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { capitalize } from '../../../utils/capitalize';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { useAwareness } from './useAwareness';

class YProvider {
  #ydocs: Record<string, Y.Doc> = {};
  #webProviders: Record<string, WebrtcProvider> = {};
  #wsProviders: Record<string, HocuspocusProvider> = {};

  async create(name: string) {
    if (!this.has(name)) {
      // create a new Y document
      const ydoc = new Y.Doc();
      this.#ydocs[name] = ydoc;

      // register with a Hocuspocus server provider
      const wsProvider = new HocuspocusProvider({
        url: `${process.env.REACT_APP_WS_PROTOCOL}//${process.env.REACT_APP_HOCUSPOCUS_BASE_URL}`,
        name,
        document: ydoc,
      });
      this.#wsProviders[name] = wsProvider;

      // register with a WebRTC provider
      const providerOptions = {
        awareness: wsProvider.awareness,
        password: name + 'cristata-development',
      };
      if (process.env.NODE_ENV === 'production') {
        providerOptions.password = (
          await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(name))
        ).toString();
      }
      // @ts-expect-error all properties are actually optional
      const webProvider = new WebrtcProvider(name, ydoc, providerOptions);
      this.#webProviders[name] = webProvider;
    }

    return this.get(name);
  }

  get(name: string) {
    const ydoc = this.#ydocs[name];
    const webProvider = this.#webProviders[name];
    const wsProvider = this.#wsProviders[name];

    return { ydoc, webProvider, wsProvider };
  }

  has(name: string): boolean {
    return !!Object.keys(this.#ydocs).find((key) => key === name);
  }

  delete(name: string): void {
    if (this.has(name)) {
      this.#ydocs[name].destroy();
      delete this.#ydocs[name];
      this.#webProviders[name].destroy();
      delete this.#webProviders[name];
      this.#wsProviders[name].destroy();
      delete this.#wsProviders[name];
    }
  }
}

function useY({ collection, id, user, schemaDef }: UseYProps, deps: DependencyList = []): UseYReturn {
  const [ydoc, setYdoc] = useState<Y.Doc>();
  const providerRef = useRef(new YProvider());
  const [webProvider, setWebProvider] = useState<WebrtcProvider>();
  const [wsProvider, setWsProvider] = useState<HocuspocusProvider>();
  const [, setSettingsMap] = useState<Y.Map<IYSettingsMap>>();
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));

  useEffect(() => {
    let mounted = true;
    const y = providerRef.current;

    const tenant = localStorage.getItem('tenant');
    y.create(`${tenant}.${collectionName}.${id}`).then((data) => {
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
      y.delete(`${tenant}.${collectionName}.${id}`);
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return await getYFields(this, schemaDef, opts);
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

  const [sharedValues, setSharedValues] = useState<Record<string, unknown>>({});
  const [sharedValuesInternal, setSharedValuesInternal] = useState<Record<string, unknown>>({});
  const handleDocUpdate = AwesomeDebouncePromise(async () => {
    if (schemaDef) {
      setSharedValues(await retObj.getData());
      setSharedValuesInternal(await retObj.getData({ retainReferenceObjects: true, keepJsonParsed: true }));
    }
  }, 300);
  useEffect(() => {
    if (ydoc && schemaDef) {
      ydoc.on('update', handleDocUpdate);
      return () => {
        ydoc.off('update', handleDocUpdate);
      };
    }
  });

  return { ...retObj, data: sharedValues, fullData: sharedValuesInternal };
}

interface UseYProps {
  collection: string;
  id: string;
  user?: ReturnType<typeof useAwareness>[0];
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

export type { IYSettingsMap, FakeProvider, EntryY, FieldY };
export { useY };
