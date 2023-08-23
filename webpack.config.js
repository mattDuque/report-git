const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: ['./index.tsx'],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                exclude: /node_modules|packages/,
                test: /\.jsx?$/,
                use: 'babel-loader'
            },
            {
                test: /\.(gif|png|jpe?g|svg|ttf)$/i,
                use: [
                    'file-loader',
                ],
            }
        ],
    },
    devtool: "source-map",
    optimization: {
        moduleIds: 'named',
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve('./public', 'index.html'),
            filename: 'index.html',
            hash: true
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
}
