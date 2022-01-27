const CopyPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin").default

module.exports = {
    entry: {
        'bundle': [
            './source/main.js'
        ]
    },
    devtool: 'source-map',
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./static/", to: "." },
            ],
        }),
        new MiniCssExtractPlugin()
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                minify: TerserPlugin.uglifyJsMinify,
                terserOptions: {
                    compress: true
                },
                parallel: true,
            })
        ],
    },
    module: {
        rules: [
            // CSS Styles
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            // GLSL Fragments
            {
                test: /\.(frag|vert)$/i,
                use: {
                    loader: 'webpack-glsl-minify',
                    options: {
                        preserveUniforms: true,
                        preserveVariables: true
                    }
                },
            }
        ],
    },
}
