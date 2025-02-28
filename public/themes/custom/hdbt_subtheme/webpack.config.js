const isDev = (process.env.NODE_ENV !== 'production');

const path = require('path');
const glob = require('glob');
const globImporter = require('node-sass-glob-importer');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('@nuxt/friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

// Handle entry points.
const Entries = () => {
  let entries = {
    styles: ['./src/scss/styles.scss'],
    // Special handling for some javascript or scss.
    // 'some-component': [
    //   './src/scss/some-component.scss',
    //   './src/js/some-component.js',
    // ],
  };

  const pattern = './src/js/**/*.js';
  const ignore = [
    // Some javascript what is needed to ignore and handled separately.
    // './src/js/component-library.js'
  ];

  glob.sync(pattern, {ignore: ignore}).map((item) => {
    entries[path.parse(item).name] = item }
  );
  return entries;
};

module.exports = {
  entry() {
    return Entries();
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: 'js/async/[name].chunk.js',
    pathinfo: true,
    filename: 'js/[name].min.js',
    publicPath: '../',
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, 'src/icons')
        ],
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  'ie': '11',
                  'ios': '10'
                }
              }]
            ]
          }
        },
        type: 'javascript/auto',
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              'postcssOptions': {
                'config': path.join(__dirname, 'postcss.config.js'),
              },
              sourceMap: isDev,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
              sassOptions: {
                importer: globImporter()
              },
            },
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },
  resolve: {
    modules: [
      path.join(__dirname, "node_modules")
    ],
    extensions: [".js", ".json"],
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new RemoveEmptyScriptsPlugin(),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname),
    }),
    new SVGSpritemapPlugin([
      path.resolve(__dirname, 'src/icons/**/*.svg'),
    ], {
      output: {
        filename: './icons/sprite.svg',
        svg: {
          sizes: false
        }
      },
      sprite: {
        prefix: false,
        gutter: 0,
        generate: {
          title: false,
          symbol: true,
          use: true,
          view: '-view'
        }
      },
    }),
    new CopyPlugin({
      'patterns': [
        {
          'context': './',
          'from': 'node_modules/hyphenopoly/min/{Hyphenopoly_Loader,Hyphenopoly}.js',
          'to': path.resolve(__dirname, 'dist') + '/js/hyphenopoly/',
          'force': true,
          'flatten': true
        }, {
          'context': './',
          'from': 'node_modules/hyphenopoly/min/patterns/{fi,sv,en-gb,ru}.wasm',
          'to': path.resolve(__dirname, 'dist') + '/js/hyphenopoly/patterns/',
          'globOptions': {
            'extglob': true
          },
          'force': true,
          'flatten': true
        },
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/@splidejs/splide/dist/css/splide-core.min.css',
          to: 'css/splide/splide-core.min.css'
        },
        {
          from: 'node_modules/@splidejs/splide/dist/js/splide.min.js',
          to: 'js/splide/splide.min.js'
        },
        {
          from: 'node_modules/tiny-slider/dist/tiny-slider.css',
          to: 'css/tiny-slider/tiny-slider.css'
        },
        {
          from: 'node_modules/tiny-slider/dist/tiny-slider.js',
          to: 'js/tiny-slider/tiny-slider.js'
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].min.css',
    }),
  ],
  watchOptions: {
    aggregateTimeout: 300,
  },
  // Tell us only about the errors.
  stats: 'errors-only',
  // Suppress performance errors.
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
