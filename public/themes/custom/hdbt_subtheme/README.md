# HDBT Subtheme

## Introduction

HDBT Subtheme uses the **@hdbt/theme-builder** (built on esbuild) to compile JS/React and SCSS files. The SVG icons are combined into a sprite.svg via svg-sprite.

As the HDBT Subtheme is only distributed via the [HELfi Platform](https://github.com/City-of-Helsinki/drupal-helfi-platform), it doesn't have an upgrade path per se. In case there is a demand for upgradeability for existing projects then of course we will consider changing the theme to an upgradeable model. 

## Requirements

HDBT Subtheme requires HDBT theme as a base theme and it should be installed in `/themes/contrib/hdbt`.

**Important:** Following City of Helsinki standard practice, you must run `npm install` in **both** the parent theme and the subtheme.

Requirements for developing:
- [NodeJS ( ^ 22.x )](https://nodejs.org/en/)
- [NPM](https://npmjs.com/)
- optional [NVM](https://github.com/nvm-sh/nvm)

## Commands

| Command           | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| npm i             | Install dependencies and link local packages.                                     |
| npm ci            | Install a project with a clean slate. Use especially in CI environments.          |
| npm run dev       | Compile styles for development environment and watch file changes.                |
| npm run build     | Build packages for production. Minify CSS/JS. Create icon sprite.                |
| npm run typecheck | Run TypeScript type checking (strict - fails on errors).                          |
| npm run lint      | Run linting for SCSS and JavaScript files.                                        |

## Setup

### Initial Setup (One-time)

Setup the developing environment by running:

```bash
# 1. Install parent theme dependencies (required!)
cd public/themes/contrib/hdbt
nvm use
npm install

# 2. Install subtheme dependencies
cd ../custom/hdbt_subtheme
nvm use
npm install
```

**Why install parent theme?** The subtheme uses `@hdbt/theme-builder` and imports React components from the parent theme.

### Development Workflow

Start development mode with file watching:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Structure for files and folders

```
hdbt_subtheme
│   README.md
│   theme-builder.mjs          # Build configuration
│   tsconfig.json              # TypeScript configuration
└───templates                  # Twig templates
│   └───block
│   └───content
│   └───...
└───src                        # Source files
│   └───scss                   # Styles
│   │   │   styles.scss
│   │   └───base
│   │   └───components
│   │   └───...
│   └───js                     # JavaScript & React
│   │   │   common.js          # Vanilla JS files
│   │   │   gallery-settings.js
│   │   └───react/             # React applications
│   │       └───apps/
│   │           └───search/    # Site search
│   └───icons                  # SVG icons
│       |   some-icon.svg
└───dist                       # Built files (generated)
    └───css
        |   styles.min.css
        |   hdbt-icons.css
    └───js
        |   common.min.js
        |   search-app.min.js  # React apps bundled
    └───icons
        |   sprite-xxxxx.svg   # Generated sprite with hash
```

## Architecture

The subtheme uses **@hdbt/theme-builder** from the parent theme (esbuild for JS/React, Sass for CSS, svg-sprite for icons).

React components can be imported from the parent theme using path aliases configured in `tsconfig.json`:
```typescript
import CardItem from '@/react/common/Card';
```

## How tos

### TypeScript show warnings from the parent theme

This is expected behavior. The parent theme may have TypeScript errors that don't affect the build. The subtheme uses `typecheck:warn` which shows warnings but continues building successfully.

### How can I add a new SVG icon and then use it on my site?

1. Add your custom icon to `./src/icons/`, e.g., `my-awesome-icon.svg`
2. Run `npm run build` to generate the sprite
3. Clear Drupal caches

The icons can be used in Twig:

```twig
{# HDBT Subtheme specific icons #}
{% include "@hdbt_subtheme/misc/icon.twig" with {icon: 'my-awesome-icon'} %}

{# HDBT specific icons #}
{% include "@hdbt/misc/icon.twig" with {icon: 'google-view'} %}
```

To use the icon in SCSS:

```scss
background-image: url('../icons/my-awesome-icon.svg');
```

### My JavaScript has unexpected errors when loading a page in Drupal

If you have compiled the code with dev-flag (`npm run dev`), then the sourcemaps expect the JS files to be found in correct places.
This means that JS preprocessing (minifying) should be turned off. Add the following lines to `local.settings.php`:

```php
$config['system.performance']['css']['preprocess'] = 0;
$config['system.performance']['js']['preprocess'] = 0;
```

### I need to rebuild caches every time I build the css or change the twig files. How can I automate it?

You can create a `local.settings.php` and `local.services.yml` files to `/sites/default/` folder and paste the following contents in them.

**_Keep in mind that using the Null Cache Backend is the primary culprit for caching issues. F.e. Something works in local environment, but not in production environment._**

local.services.yml:
```
parameters:
  twig.config:
    debug: true # Displays twig debug messages, developers like them
    auto_reload: true # Reloads the twig files on every request, so no drush cache rebuild is required
    cache: false # No twig internal cache, important: check the example.settings.local.php to fully disable the twig cache

services:
  cache.backend.null: # Defines a Cache Backend Factory which is just empty, it is not used by default
    class: Drupal\Core\Cache\NullBackendFactory
```
local.settings.php:
```
<?php
/**
 * @file
 * An example of Drupal 9 development environment configuration file.
 */
$settings['cache']['bins']['render'] = 'cache.backend.null';
$settings['cache']['bins']['page'] = 'cache.backend.null';
$settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.null';

$settings['skip_permissions_hardening'] = TRUE;

$config['system.performance']['css']['preprocess'] = 0;
$config['system.performance']['js']['preprocess'] = 0;
$config['system.logging']['error_level'] = 'some';
```
