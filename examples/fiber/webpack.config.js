const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**@type {import ('webpack').Configuration} */
module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        filename: 'main.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js(x?)$/,
            loader: 'babel-loader'
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
        hot: true,
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Simple react',
            template: './public/index.html'
        }),
        new webpack.HotModuleReplacementPlugin({})
    ]
}