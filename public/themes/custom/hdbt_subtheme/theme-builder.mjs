import path from 'path';
import { globSync } from 'glob';
import { buildAll, watchAndBuild } from '@hdbt/theme-builder/builder';

const __dirname = path.resolve();
const isDev = process.argv.includes('--dev');
const isWatch = process.argv.includes('--watch');
const watchPaths = ['src/scss', 'src/js'];
const outDir = path.resolve(__dirname, 'dist');

// React apps.
const reactApps = {
  'search-app': './src/js/react/apps/search/index.tsx',
  'kore-search-app': './src/js/react/apps/kore-search/index.tsx',
};

// Vanilla JS files.
const jsFiles = globSync('./src/js/**/*.js', {
  // ignore: [],
}).reduce((acc, file) => ({
  ...acc, [path.parse(file).name]: file
}), {});

// SCSS files.
const styles = [
  ['src/scss/styles.scss', 'css/styles.min.css'],
];

// Static files.
const staticFiles = [
  ['node_modules/hyphenopoly/min/Hyphenopoly_Loader.js', `${outDir}/js/hyphenopoly/Hyphenopoly_Loader.js`],
  ['node_modules/hyphenopoly/min/Hyphenopoly.js', `${outDir}/js/hyphenopoly/Hyphenopoly.js`],
  ['node_modules/hyphenopoly/min/patterns/fi.wasm', `${outDir}/js/hyphenopoly/patterns/fi.wasm`],
  ['node_modules/hyphenopoly/min/patterns/sv.wasm', `${outDir}/js/hyphenopoly/patterns/sv.wasm`],
  ['node_modules/hyphenopoly/min/patterns/en-gb.wasm', `${outDir}/js/hyphenopoly/patterns/en-gb.wasm`],
  ['node_modules/hyphenopoly/min/patterns/ru.wasm', `${outDir}/js/hyphenopoly/patterns/ru.wasm`],
  ['node_modules/@splidejs/splide/dist/css/splide-core.min.css', `${outDir}/css/splide/splide-core.min.css`],
  ['node_modules/@splidejs/splide/dist/js/splide.min.js', `${outDir}/js/splide/splide.min.js`],
  ['node_modules/tiny-slider/dist/tiny-slider.css', `${outDir}/css/tiny-slider/tiny-slider.css`],
];

// Builder configurations.
const jsConfig = { jsFiles, isDev, outDir };
const cssConfig = { styles, isDev, outDir };
const reactConfig = { reactApps, isDev, outDir };
const iconsConfig = {
  inputPattern: 'src/icons/**/*.svg',
  outDir,
  spriteOut: 'icons/sprite.svg',
  cssOut: 'css/hdbt-icons.css',
  ckeditorCssOut: 'css/ckeditor-icons.css',
  jsonOut: 'icons.json',
  iconClass: 'hel',
};

const buildArguments = { 
  outDir, 
  iconsConfig, 
  staticFiles, 
  jsConfig, 
  reactConfig,
  cssConfig 
};

// Build and watch using parent theme's builder.
if (isWatch) {
  watchAndBuild({
    buildArguments,
    watchPaths,
  });
} else {
  buildAll(buildArguments)
    .catch((e) => {
      console.error('❌ Build failed:', e);
      process.exit(1);
    });
}
