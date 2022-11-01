module.exports = function override(config, env) {
  // the cristata packages that run in the server rely on these, but the types
  // we import from the packages do not need them, so we tell webpack to stop
  // complaining that there server node modules are not available in the client app
  config.resolve.fallback = {
    fs: false,
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    process: require.resolve('process/browser'),
  };

  return config;
};
