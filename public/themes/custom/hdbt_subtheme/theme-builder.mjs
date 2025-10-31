import path from 'path';
import { globSync } from 'glob';
import { buildAll, watchAndBuild } from '@hdbt/theme-builder/builder';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirnameCustom = path.dirname(__filename);
const require = createRequire(import.meta.url);
const esbuild = require('../../contrib/hdbt/node_modules/esbuild');

const __dirname = path.resolve();
const isDev = process.argv.includes('--dev');
const isWatch = process.argv.includes('--watch');
const watchPaths = ['src/js', 'src/scss'];
const outDir = path.resolve(__dirname, 'dist');

// React apps.
const reactApps = {
  'search-app': './src/js/react/apps/search/index.tsx',
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

// Custom React build function to handle React 18 properly
async function buildReactApp() {
  console.warn('🔨 Building React app with custom config...');
  try {
    await esbuild.build({
      entryPoints: ['./src/js/react/apps/search/index.tsx'],
      bundle: true,
      minify: !isDev,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      outfile: `${outDir}/js/search-app.min.js`,
      tsconfig: './tsconfig.json',
      define: {
        'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
      },
      charset: 'utf8',
      legalComments: 'none',
      sourcemap: isDev,
      plugins: [{
        name: 'dedupe-react-full',
        setup(build) {
          build.onResolve({ filter: /^react(-dom)?(\/client)?$/ }, args => ({
            path: require.resolve(args.path),
          }));
        }
      }]
    });
    console.warn('✅ React app built successfully');
  } catch (error) {
    console.error('❌ React build failed:', error);
    throw error;
  }
}

// Builder configurations.
const reactConfig = { reactApps: {}, isDev, outDir }; // Empty because we build it manually
const jsConfig = { jsFiles, isDev, outDir };
const cssConfig = { styles, isDev, outDir };
const iconsConfig = {
  inputPattern: 'src/icons/**/*.svg',
  outDir,
  spriteOut: 'icons/sprite.svg',
  cssOut: 'css/hdbt-icons.css',
  ckeditorCssOut: 'css/ckeditor-icons.css',
  jsonOut: 'icons.json',
  iconClass: 'hel',
};
const buildArguments = { outDir, iconsConfig, staticFiles, jsConfig, reactConfig, cssConfig };

if (isWatch) {
  // Build everything first, then React app
  buildAll(buildArguments).then(() => buildReactApp()).then(() => {
    watchAndBuild({
      buildArguments,
      watchPaths,
    });
  });
} else {
  // Build everything else first, then React app (so it doesn't get cleaned)
  buildAll(buildArguments)
    .then(() => buildReactApp())
    .catch((e) => {
      console.error('❌ Build failed:', e);
      process.exit(1);
    });
}
