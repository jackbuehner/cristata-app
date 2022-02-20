/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useMemo, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import packageJson from '../../../../package.json';

/**
 * Return a y document, a y map for storing settings, and a connection to the
 * hocuspocus server.
 *
 * @returns [doc, map, hocuspocus]
 */
function useY({ name, ws }: UseYProps, deps: DependencyList = []): ReturnType {
  // create a new Y document
  const doc = useMemo(() => new Y.Doc(), []);

  // create a setting map for this document (used to sync settings accross all editors)
  const settingsMap = useMemo(() => doc.getMap<IYSettingsMap>('settings'), [doc]);

  // register with a WebSocket provider
  const params = useMemo(() => ({ version: packageJson.version }), []);
  const hocuspocus = useMemo(
    () => new WebsocketProvider(ws, name, doc, { params }),
    [ws, name, doc, params, ...deps]
  );

  // check that the doc has received the server data first
  const [updated, setUpdated] = useState<boolean>(false);
  doc.once('update', () => {
    if (!updated) setUpdated(true);
  });

  // whether the doc is connected to the server and is up-to-date
  let isConnected = undefined;
  if (hocuspocus.wsconnecting) isConnected = undefined;
  else if (hocuspocus.wsconnected && !updated) isConnected = undefined;
  else if (hocuspocus.wsconnected && updated) isConnected = true;
  else isConnected = false;

  return [doc, settingsMap, hocuspocus, isConnected];
}

interface UseYProps {
  ws: string;
  name: string;
}

interface IYSettingsMap {
  trackChanges?: boolean;
}

type ReturnType = [Y.Doc, Y.Map<IYSettingsMap>, WebsocketProvider, boolean | undefined];

export type { IYSettingsMap };
export { useY };
