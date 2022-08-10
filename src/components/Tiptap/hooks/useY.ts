import { DependencyList, useEffect, useRef } from 'react';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

class YProvider {
  #ydocs: Record<string, Y.Doc> = {};
  #providers: Record<string, WebrtcProvider> = {};

  async create(name: string) {
    if (!this.has(name)) {
      // create a new Y document
      const ydoc = new Y.Doc();
      this.#ydocs[name] = ydoc;

      // register with a WebRTC provider
      const providerOptions = {
        password: await (async () => {
          if (process.env.NODE_ENV === 'production') {
            return (await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(name))).toString();
          }
          return name + 'cristata-development';
        })(),
      };
      // @ts-expect-error all properties are actually optional
      const provider = new WebrtcProvider(name, ydoc, providerOptions);
      this.#providers[name] = provider;
    }

    return this.get(name);
  }

  get(name: string) {
    const ydoc = this.#ydocs[name];
    const provider = this.#providers[name];

    return { ydoc, provider };
  }

  has(name: string): boolean {
    return !!Object.keys(this.#ydocs).find((key) => key === name);
  }

  delete(name: string): void {
    if (this.has(name)) {
      this.#ydocs[name].destroy();
      delete this.#ydocs[name];
      this.#providers[name].destroy();
      delete this.#providers[name];
    }
  }
}

const y = new YProvider();

function useY({ name: docName }: UseYProps, deps: DependencyList = []): ReturnType {
  let ydoc = useRef<Y.Doc>();
  const provider = useRef<WebrtcProvider>();
  const settingsMap = useRef<Y.Map<IYSettingsMap>>();
  useEffect(() => {
    let mounted = true;

    const tenant = localStorage.getItem('tenant');
    y.create(`${tenant}.${docName}`).then((data) => {
      if (mounted) {
        ydoc.current = data.ydoc;
        provider.current = data.provider;

        // create a setting map for this document (used to sync settings accross all editors)
        settingsMap.current = ydoc.current.getMap<IYSettingsMap>('settings');
      }
    });

    return () => {
      y.delete(docName);
      ydoc.current = undefined;
      provider.current = undefined;
      settingsMap.current = undefined;
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docName, ...deps]);

  return [ydoc.current, settingsMap.current, provider.current, provider.current?.connected];
}

interface UseYProps {
  name: string;
}

interface IYSettingsMap {
  trackChanges?: boolean;
}

type ReturnType = [
  Y.Doc | undefined,
  Y.Map<IYSettingsMap> | undefined,
  WebrtcProvider | undefined,
  boolean | undefined
];

type FakeProvider = { awareness: awarenessProtocol.Awareness; connected?: boolean };

export type { IYSettingsMap, FakeProvider };
export { useY };
