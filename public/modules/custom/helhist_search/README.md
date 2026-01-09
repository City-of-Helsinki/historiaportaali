# HelHist Search

Site search functionality, with Search API and React frontend based on HDS.

## Configuration

### Search page node

Configure the node that hosts the search functionality at:

**Admin Path:** `/admin/tools/helhist-search`

Or navigate via the admin menu: **Tools** → **Site search settings**

Select the node that will serve as the main search page. The URL alias of this
node can be managed by content managers in the usual way (e.g., `/search`, `/haku`, `/sok`).

This decouples the search implementation from hardcoded node IDs, making it
environment-agnostic and allowing flexible URL management and use of Hero and
other instructional content management to the search page.

## Twig Functions

### search_url(field_name, value)

Generates search URL with filter or keyword parameter based on field type.

```twig
{{ search_url('field_phenomena', 'Term Name') }} → /SEARCH_PAGE?phenomena=Term%20Name
{{ search_url('field_keywords', 'Term Name') }} → /SEARCH_PAGE?q=Term%20Name
```

**Filter fields** (use filter parameters):
- `field_phenomena` → `?phenomena=`
- `field_neighbourhoods` → `?neighbourhoods=`
- `field_formats` → `?formats=`

Other fields default to keyword search (`?q=`).

## Blocks

- **HelHist Header Search** (`helhist_search_header_search_block`)
  - Header search form that appears on all pages except the configured search page
- **HelHist Frontpage Search** (`helhist_search_frontpage_block`)
  - Search form block designed for the front page
- **HelHist React Search** (`helhist_search_react_search_block`)
  - Main React-based search interface shown only on the configured search page

## Search API Processors

Custom processors that add fields to the search index:

- **Listing Image URL** (`listing_image_url`)
  - Generates styled image URL from node liftup images and media entities for search result cards
- **Content Type** (`content_type`)
  - Adds content type classification (article/media) to enable filtering by entity type

## Development 

Ensure documents are indexed
```
make shell
search-api:rebuild-tracker
drush search-api:clear content_and_media
drush search-api:index content_and_media
```

### Frontend development

React part located at the `hdbt_subtheme` directory.
