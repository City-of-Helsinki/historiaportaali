# Helsinki History Portal

## Environments

Env | Branch | URL
--- | ------ | ---
local | - | http://historiaportaali.docker.so
test | `dev` | https://historia.test.hel.ninja
staging | `main` | https://historia.stage.hel.ninja
production | `main` | https://historia.hel.fi

## Requirements

You need to have these applications installed to operate on all environments:

- [Docker](https://github.com/druidfi/guidelines/blob/master/docs/docker.md)
- [Stonehenge](https://github.com/druidfi/stonehenge)
- [Openshift CLI](https://github.com/openshift/oc)
  - See [Using OpenShift Origin Client (OC)](https://github.com/City-of-Helsinki/drupal-helfi-platform/wiki/Using-OpenShift-Origin-Client-(OC)) - e.g. db fetching

## Running Stonehenge
```
stonehenge up
```

In project directory, start with:

```
$ make up
```

Stop with:

```
$ make stop
```

If only stopped, Stonehenge will run on boot. Destroy with:

```
$ make down
```

## Create and start the project

To create and start the environment, in project directory, have `dump.sql` and:

```
$ make fresh
```

## Login to Drupal container

```
$ make shell
```


## Instance specific features

### Content types

The customized/non-standard helfi content types.

- **article** (`article`): Main historical content of the website. Customization like with year range, phenomena, turning points, buildings, neighbourhoods, Finna import, geolocation.
- **listing_page**: Lists articles and content, specific to this site.
- **map_page**: Solely for https://historia.hel.fi/fi/kartta page
- **map_layer**: Map layers for the map page, WMS of kartta.hel.fi
  - Rabbit hole module prevent direct view of the entity
- **kore_school** (`kore_school`): Koulurekisteri (school register) archive entries.
  - This content was migrated from old chool register (removed in https://github.com/City-of-Helsinki/historiaportaali/pull/452/changes/1268c82421aa7577dae30b6792522e3c2cf9e245)

### Media types

The customized/non-standard helfi media types.
 
- **image** (helfi, extended): Finna ID, year range, phenomena, buildings, neighbourhoods, keywords, authors, copyrights, formats, languages, geolocation, transcript, photographer. Used in galleries, maps, search.
- **kore_image** (custom): KoRe school archive images (Finna ID, photographer).
- **hel_map** No entities in production.
- **helfi_chart** (helfi, extended): Charts. Extended with Infogram ID field -> infogram graph embeds.

### Search

Two React search apps (HDS-based):
* **main search** (articles + media, `content_and_media` index)
* **KoRe search** (Koulurekisteri schools, `kore_school` index). Both use Elasticsearch and share blocks, config, and mapping mode.

- Backend:
  - [helhist_search](public/modules/custom/helhist_search/README.md) (blocks, config, Search API processors),
  - [helhist_kore_search](public/modules/custom/helhist_kore_search) (KoRe block)
- Frontend:
  - [React apps](public/themes/custom/hdbt_subtheme/src/js/react/apps/README.md) (search, kore-search)

Search configs: **Text mapping** for local, **Keyword mapping** for server. Configure at `/admin/tools/helhist-search`. See [helhist_search README](public/modules/custom/helhist_search/README.md#search-mapping-mode). Defines also the parent node that host the search apps.

### Integrations

- **Map (Leaflet)**: WMS layers from `map_layer` nodes.
  - Module: [helhist_map](public/modules/custom/helhist_map)
  - Theme js: [map-controls.js](public/themes/custom/hdbt_subtheme/src/js/map-controls.js)
  - Theme js: [map.js](public/themes/custom/hdbt_subtheme/src/js/map.js)
  - Theme js: [map-comparison.js](public/themes/custom/hdbt_subtheme/src/js/map-comparison.js).
- **Finna.fi import**: Content managers import metadata by Finna ID into articles/images.
  - Custom module: [finna_import.js](public/modules/custom/helhist_admin_forms/js/finna_import.js).
