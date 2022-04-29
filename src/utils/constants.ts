const gitpod = {
  workspace: process.env.REACT_APP_GITPOD_WORKSPACE_URL,
  port: process.env.REACT_APP_GITPOD_APP_PORT,
  appPath: process.env.REACT_APP_GITPOD_WORKSPACE_URL?.replace(
    'https://',
    (process.env.REACT_APP_GITPOD_APP_PORT || '') + '-'
  ),
  serverPath: process.env.REACT_APP_GITPOD_WORKSPACE_URL?.replace(
    'https://',
    (process.env.REACT_APP_GITPOD_SERVER_PORT || '') + '-'
  ),
};

const server = {
  httpProtocol: process.env.REACT_APP_API_PROTOCOL || 'https:',
  wsProtocol: process.env.REACT_APP_WS_PROTOCOL || 'wss:',
  path: process.env.REACT_APP_API_BASE_URL || gitpod.serverPath,
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
