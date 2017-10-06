const fs = require('fs');
const path = require('path');
const extractTextPlugin = require('extract-text-webpack-plugin');

function getExternals() {
    return fs.readdirSync('node_modules')
        .concat(['react-dom/server'])
        .filter((mod) => mod !== '.bin')
        .reduce((externals, mod) => {
            externals[mod] = `commonjs ${mod}`;
            return externals;
        }, {});
}

module.exports = [
    {
        name: 'Client',
        entry: path.join(__dirname, 'source', 'views', 'index.client.src.js'),
        output: {
            filename: 'app.js',
            path: path.resolve(__dirname, 'public')
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.css$/,
                    loader: extractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: 'css-loader'
                    })
                }
            ]
        },
        plugins: [
            new extractTextPlugin('[name].css')
        ],
        watch: true
    },
    {
        name: 'Server',
        entry: path.join(__dirname, 'source', 'views', 'index.server.src.js'),
        output: {
            filename: 'ssr.app.js',
            path: path.resolve(__dirname, 'source', 'server', 'static_markup',),
            libraryTarget: 'commonjs2',
        },
        target: 'node',
        externals: getExternals(),
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.css$/,
                    loader: 'ignore-loader'
                }
            ]
        },
        watch: true
    }
];