import { DependencyList, useEffect, useRef, useState } from 'react';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';
import { useAwareness } from './useAwareness';

class YProvider {
  #ydocs: Record<string, Y.Doc> = {};
  #webProviders: Record<string, WebrtcProvider> = {};
  #localProviders: Record<string, IndexeddbPersistence> = {};

  async create(name: string) {
    if (!this.has(name)) {
      // create a new Y document
      const ydoc = new Y.Doc();
      this.#ydocs[name] = ydoc;

      // register with a WebRTC provider
      let providerOptions;
      if (process.env.NODE_ENV === 'production') {
        providerOptions = {
          password: (await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(name))).toString(),
        };
      } else {
        providerOptions = { password: name + 'cristata-development' };
      }
      // @ts-expect-error all properties are actually optional
      const webProvider = new WebrtcProvider(name, ydoc, providerOptions);
      const localProvider = new IndexeddbPersistence(name, ydoc);
      this.#webProviders[name] = webProvider;
      this.#localProviders[name] = localProvider;
    }

    return this.get(name);
  }

  get(name: string) {
    const ydoc = this.#ydocs[name];
    const webProvider = this.#webProviders[name];
    const localProvider = this.#localProviders[name];

    return { ydoc, webProvider, localProvider };
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
      this.#localProviders[name].destroy();
      delete this.#localProviders[name];
    }
  }
}

function useY({ name: docName, user }: UseYProps, deps: DependencyList = []): UseYReturn {
  const [ydoc, setYdoc] = useState<Y.Doc>();
  const providerRef = useRef(new YProvider());
  const [webProvider, setWebProvider] = useState<WebrtcProvider>();
  const [localProvider, setLocalProvider] = useState<IndexeddbPersistence>();
  const [, setSettingsMap] = useState<Y.Map<IYSettingsMap>>();

  useEffect(() => {
    let mounted = true;
    const y = providerRef.current;

    const tenant = localStorage.getItem('tenant');
    y.create(`${tenant}.${docName}`).then((data) => {
      if (mounted) {
        setYdoc(data.ydoc);
        setWebProvider(data.webProvider);
        setLocalProvider(data.localProvider);

        // create a setting map for this document (used to sync settings accross all editors)
        setSettingsMap(ydoc?.getMap<IYSettingsMap>('__settings'));
      }
    });

    return () => {
      y.delete(`${tenant}.${docName}`);
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docName, ...deps]);

  const awareness = useAwareness({ provider: webProvider, user }); // get list of who is editing the doc

  // consider synced once the local provider is connected
  // and the web provider awareness has propogated (at least one array value)
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (!synced && awareness.length > 0) {
      const handleSync = () => setSynced(true);
      localProvider?.on('synced', handleSync);
      return () => {
        localProvider?.off('synced', handleSync);
      };
    }
  }, [awareness, localProvider, synced, webProvider, ydoc]);

  // the web provider is connected when there is a room
  // and the web provider is set to be connected
  const connected = (webProvider?.room && webProvider.shouldConnect) || undefined;

  return {
    ydoc: ydoc,
    provider: webProvider,
    connected: connected,
    // hide awareness if web or local provider is not connected
    awareness: synced && connected ? awareness : [],
    initialSynced: synced,
  };
}

interface UseYProps {
  name: string;
  user?: ReturnType<typeof useAwareness>[0];
}

interface IYSettingsMap {
  trackChanges?: boolean;
}

type UseYReturn = EntryY;

interface EntryY {
  ydoc: Y.Doc | undefined;
  provider: WebrtcProvider | undefined;
  connected: boolean | undefined;
  awareness: ReturnType<typeof useAwareness>;
  initialSynced: boolean;
}

interface FieldY extends EntryY {
  field: string;
  user?: ReturnType<typeof useAwareness>[0];
}

type FakeProvider = { awareness: awarenessProtocol.Awareness; connected?: boolean };

export type { IYSettingsMap, FakeProvider, EntryY, FieldY };
export { useY };
