const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dist = 'dist';
const isTestMode = process.env.NODE_ENV == 'test';

config = {
    context: path.resolve('./'),

    output: {
        filename: `${dist}/[name].js`,
        publicPath: '/',
        libraryTarget: isTestMode ? undefined : "commonjs"
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.less'],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: [/node_modules/, /dist/],
            },
        ],
    },

    devtool: isTestMode ? 'eval' : 'source-map',

    devServer: {
        contentBase: path.resolve('./dist'),
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'lens-flow',
            filename: path.resolve('./dist', 'index.html'),
        }),
    ],
};

if (isTestMode) {
    config.entry = { specs: './index.spec' };
} else {
    config.entry = { lens: './index' };
}

module.exports = config;
