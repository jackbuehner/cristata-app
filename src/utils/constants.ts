const gitpod = {
  workspace: import.meta.env.VITE_GITPOD_WORKSPACE_URL,
  port: import.meta.env.VITE_GITPOD_APP_PORT,
  appPath: import.meta.env.VITE_GITPOD_WORKSPACE_URL?.replace(
    'https://',
    (import.meta.env.VITE_GITPOD_APP_PORT || '') + '-'
  ),
  serverPath: import.meta.env.VITE_GITPOD_WORKSPACE_URL?.replace(
    'https://',
    (import.meta.env.VITE_GITPOD_SERVER_PORT || '') + '-'
  ),
};

const server = {
  httpProtocol: import.meta.env.VITE_API_PROTOCOL || 'https:',
  wsProtocol: import.meta.env.VITE_WS_PROTOCOL || 'wss:',
  path: import.meta.env.VITE_API_BASE_URL || gitpod.serverPath,
  location: '',
  wsLocation: '',
};

server.location = `${server.httpProtocol}//${server.path}`;
server.wsLocation = `${server.wsProtocol}//${server.path}`;

const constants = {
  server,
};

export default constants;
export { server };
