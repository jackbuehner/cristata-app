const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    ['/paladin-news/api', '/paladin-news/api/*'],
    createProxyMiddleware('/paladin-news/api', {
      target: `${process.env.REACT_APP_API_PROTOCOL}//${process.env.REACT_APP_API_BASE_URL}${process.env.PUBLIC_URL}`,
      changeOrigin: true,
      ws: true,
      logLevel: 'error',
      pathRewrite: {
        '^/paladin-news/api': '',
      },
    })
  );
};
