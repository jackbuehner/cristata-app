import React, { createContext, useCallback, useEffect, useState } from 'react';
import { handleSocketEvent } from './handleSocketEvent';

export interface IGitHubDataFreshness {
  project?: {
    [key: number]: {
      last_fetch: number; // from Date.now()
      last_updated: number; // from Date.now()
    };
  };
}

export interface IGitHubDataFreshnessContext {
  data: IGitHubDataFreshness | undefined;
  set: React.Dispatch<React.SetStateAction<IGitHubDataFreshness>> | undefined;
}

const GitHubDataFreshnessContext = createContext<IGitHubDataFreshnessContext>({
  data: undefined,
  set: undefined,
});

/**
 * Component that connects to the cristata websocket and provides `GitHubDataFreshnessContext`.
 *
 * `GitHubDataFreshnessContext` contains data about when a github item has been updated and refetched.
 * It contains the ability for components to update the date and time when they refetched.
 */
function CristataWebSocket(props: { children: React.ReactNode }) {
  const [githubDataFreshness, setGithubDataFreshness] = useState<IGitHubDataFreshness>({
    project: undefined,
  });

  /**
   * Returns whether text is valid JSON.
   */
  const isJSON = (text: string) => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleWebSocketEvent = useCallback(
    (event, data) => {
      return handleSocketEvent(event, data, githubDataFreshness);
    },
    [githubDataFreshness]
  );

  const tenant = localStorage.getItem('tenant');

  /**
   * Connect to the websocket server and handle any messages.
   */
  useEffect(() => {
    const connectWS = () => {
      const ws = new WebSocket(
        `${process.env.REACT_APP_WS_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}/websocket?tenant=${tenant}`
      );
      ws.addEventListener('message', ({ data }) => {
        if (isJSON(data)) {
          const JSONData: { event: string; [key: string]: any } = JSON.parse(data);
          const result = handleWebSocketEvent(JSONData.event, JSONData);
          if (result && result.type === 'github_freshness') {
            setGithubDataFreshness(result.data);
          }
        } else {
          console.log(data);
        }
      });
      ws.addEventListener('open', () => {
        const data = {
          type: 'client_info',
          id: 'nfeh78294hg33209gj3h908fne',
          events: ['project', 'project_column', 'project_card'],
        };
        console.log(`[WebSocket] Connected to the server.`);
        ws.send(JSON.stringify(data));
      });
      ws.addEventListener('close', (e) => {
        console.log(
          `[WebSocket] Connection to the server was closed. Reconnect will be attempted in 1 second. ${e.reason}`
        );
        setTimeout(connectWS, 1000);
      });
    };
    connectWS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GitHubDataFreshnessContext.Provider value={{ data: githubDataFreshness, set: setGithubDataFreshness }}>
      {props.children}
    </GitHubDataFreshnessContext.Provider>
  );
}

export { CristataWebSocket, GitHubDataFreshnessContext };
