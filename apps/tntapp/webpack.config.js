const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  config.output.publicPath = '/assets/'
  // e.g. `config.plugins.push(new MyPlugin())`
  return config;
});
