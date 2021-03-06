const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  // entry: './example/blend/index.ts',
  // entry: './demo/texture/index.ts',
  // entry: './demo/light/index.ts',
  // entry: './example/instancingQuads/index.ts',
  // entry: './example/blockUniform/index.ts',
  // entry: './example/skybox/index.ts',
  // entry: './example/depthTestDemo/index.ts',
  // entry: './example/depthShadow/index.ts',
  // entry: './example/pointShadow/index.ts',
  // entry: './example/normalMapping/index.ts',
  // entry: './example/parallaxMapping/index.ts',
  // entry: './example/trigle/index.ts',
  // entry: './example/lightCluster/index.ts',
  // entry: './example/PBR/index.ts',
  // entry: './example/PBRWithTexture/index.ts',
  // entry: './example/ibl/index.ts',
  // entry: './example/addFont/index.ts',
  // entry: './example/particle/index.ts',
  // entry: './example/texture/index.ts',
  // entry: './example/particle_webgl2/index.ts',
  // entry: './example/skins/index.ts',
  entry: './example/gltf/index.ts',
  module: {
    rules: [{
      test: /\.glsl$/,
      use: 'webpack-glsl-loader',
      exclude: /node_modules/,
    }, {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: './',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'play.gl',
      template: './assets/index.html'
    }),
  ],
};