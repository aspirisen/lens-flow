const webpackConfig = require('../webpack.config');
const genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');

module.exports = function(config, env) {
    const result = genDefaultConfig(config, env);

    result.module.rules = result.module.rules.concat(webpackConfig.module.rules);
    result.resolve.extensions = result.resolve.extensions.concat(webpackConfig.resolve.extensions);
    result.plugins = result.plugins.concat(webpackConfig.plugins);

    return result;
};
