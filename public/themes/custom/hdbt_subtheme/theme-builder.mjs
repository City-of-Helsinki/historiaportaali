import path from 'path';
import { globSync } from 'glob';
import { buildAll, watchAndBuild } from '@hdbt/theme-builder/builder';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// Use parent theme's esbuild dependency
const esbuild = require('../../contrib/hdbt/node_modules/esbuild');
const __dirname = path.resolve();
const isDev = process.argv.includes('--dev');
const isWatch = process.argv.includes('--watch');
// Watch SCSS and vanilla JS only (React has its own watcher via esbuild)
const watchPaths = ['src/scss', 'src/js/*.js'];
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

/**
 * Custom React build function with React 18 support.
 * 
 * The hdbt/theme-builder (currently using React 17.0.2) doesn't support 
 * React 18's /client imports (e.g., react-dom/client), so we use a custom 
 * esbuild configuration. This follows the same pattern as the parent theme's 
 * buildReactApps() but with an extended plugin to handle React 18.
 * 
 * @todo Remove this custom build function once hdbt/theme-builder upgrades to React 18+
 */
async function buildReactAppsWithReact18Support(config = {}) {
  const { reactApps, outDir, isDev = false, watchMode = false } = config;

  await Promise.all(
    Object.entries(reactApps).map(async ([name, entry]) => {
      const outfile = `${outDir}/js/${name}.min.js`;

      const buildConfig = {
        entryPoints: [entry],
        bundle: true,
        minify: !isDev,
        format: 'iife',
        platform: 'browser',
        target: 'es2020',
        outfile,
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        define: {
          'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
        },
        charset: 'utf8',
        keepNames: true,
        legalComments: 'none',
        sourcemap: isDev,
        logLevel: 'silent',
        plugins: [{
          name: 'dedupe-react-with-client',
          setup(build) {
            // Extended from parent theme to support React 18's /client imports
            build.onResolve({ filter: /^react(-dom)?(\/client)?$/ }, args => ({
              path: require.resolve(args.path),
            }));
          }
        }]
      };

      try {
        if (watchMode) {
          const ctx = await esbuild.context(buildConfig);
          await ctx.watch();
        } else {
          await esbuild.build(buildConfig);
        }
      } catch (error) {
        console.error(`❌ Error building React app ${name}:`, error.message);
        throw error;
      }
    })
  );
}

// Builder configurations.
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

// Config for our custom React 18 build function
const reactConfig = { reactApps, isDev, outDir };

// Pass empty reactApps to builder to prevent double-building
const buildArguments = { 
  outDir, 
  iconsConfig, 
  staticFiles, 
  jsConfig, 
  reactConfig: { reactApps: {}, isDev, outDir }, // Empty - we build React separately
  cssConfig 
};

// Build and watch orchestration.
// Unlike parent theme, we can't use the builder's built-in React support
// because it doesn't handle React 18. So we build React apps separately.
//
// NOTE: Initial build runs twice in watch mode - this is intentional:
// 1. First buildAll() ensures everything is clean and built
// 2. Then React apps are built and start watching
// 3. watchAndBuild() does another buildAll() for consistency before watching
// This only happens once at startup and is fast (~400ms for second build).
if (isWatch) {
  buildAll(buildArguments)
    .then(() => {
      console.warn('🔨 Building React apps with custom config...');
      return buildReactAppsWithReact18Support({ ...reactConfig, watchMode: true });
    })
    .then(() => {
      console.warn('✅ React apps watching for changes...');
      // watchAndBuild calls buildAll internally (causing the second build you see)
      // but this ensures everything stays in sync
      watchAndBuild({
        buildArguments,
        watchPaths,
      });
    })
    .catch((e) => {
      console.error('❌ Build failed:', e);
      process.exit(1);
    });
} else {
  buildAll(buildArguments)
    .then(() => {
      console.warn('🔨 Building React apps with custom config...');
      return buildReactAppsWithReact18Support(reactConfig);
    })
    .then(() => {
      console.warn('✅ React apps built successfully');
    })
    .catch((e) => {
      console.error('❌ Build failed:', e);
      process.exit(1);
    });
}
