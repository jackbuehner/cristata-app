/**
 * Get's the current host of the app.
 *
 * If hosted on Vercel, uses the vercel host name (e.g. `my-site-7q03y4pi5.vercel.app`)
 *
 * If on GitPod, uses a constructed GitPod host name (e.g. `3000-green-tarantula-v54yhlbx.ws-us18.gitpod.io`)
 *
 * Otherwise, uses `window.location.host`.
 */
function getHost() {
  let host = window.location.host;
  if (process.env.REACT_APP_VERCEL_URL) host = process.env.REACT_APP_VERCEL_URL;
  else if (
    process.env.REACT_APP_GITPOD_HOSTNAME &&
    process.env.REACT_APP_GITPOD_HOSTNAME !== `${process.env.port}-`
  )
    host = process.env.REACT_APP_GITPOD_HOSTNAME;

  return host;
}

export { getHost };
