# HelHist Search

@TODO update documentation

Custom GraphQL/React search component.

Ensure documents are indexed
```
make shell 
search-api:rebuild-tracker
drush search-api:clear content_and_media
drush search-api:index content_and_media
```

CORS - add to your local development.services.yml
```
parameters:
  cors.config:
    enabled: true
    allowedHeaders: ['*']
    allowedMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
    allowedOrigins: ['*']
    allowedOriginsPatterns: []
    exposedHeaders: false
    maxAge: false
    supportsCredentials: false
```

Copy `.env` file, check `REACT_APP_DRUPAL_URL´ is correct
```
cp .env.example .env
````

Install, start and build
```
nvm install
nvm use
npm install
npm run start
npm run build
```
