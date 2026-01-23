# HelHist Search

Site search functionality, with Search API and React frontend based on HDS.

## Configuration

The configurations should be on ignore to allow different setting per environment.

### Search page node

Configure node that show the search block **Tools** → **Site search settings**: `/admin/tools/helhist-search`.

This decouples the search implementation from hardcoded node IDs, making it
environment-agnostic and allowing flexible URL management and use of Hero and
other instructional content management to the search page.

### Search mapping

The search mapping can be changed, in case search errors try out the Keyword/text mapping.
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
search-api:rebuild-tracker
drush search-api:clear content_and_media
drush search-api:index content_and_media
```

### Frontend development

React part located at the `hdbt_subtheme` directory.

Connect to platta ES proxy by changing `ELASTIC_PROXY_URL` env var.
