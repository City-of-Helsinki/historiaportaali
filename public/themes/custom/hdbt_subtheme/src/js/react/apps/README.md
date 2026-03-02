# Helhist React Apps

**Imports from parent theme**
React components can be imported from the parent theme using path aliases in
`tsconfig.json`:

```typescript
import CardItem from '@/react/common/Card';
```


## Search

Site main search & Koulurekisteri search apps using [HDS](https://hds.hel.fi/)

### Search (site main search)

Searches across content and media (`content_and_media`) index with filters.

- **Entry point:**
    - `search/index.tsx` – mounts to `#historia_search`
- **Container:**
    - `search/modules/search/SearchContainer.tsx`
- **Components:**
    - `SearchForm`
    - `ResultCard`
    - `SortOptions`
- **Store:**
    - Jotai atoms for URL state, filters, facets

### Koulurekisteri (KoRe) Search

The school register (Koulurekisteri) search. Searches for schools in the
`kore_school` index with filters.

- **Entry point:**
    - `kore-search/index.tsx` – mounts to `#historia_kore_search`
- **Container:**
    - `kore-search/KoreSearchContainer.tsx`
- **Components:**
    - `KoreSearchForm`
    - `KoreResultCard`
    - `SortOptions`
    - `YearRangeInput`
        - A custom year range slider with HDS TextInput fields for start/end
        year filtering
- **Store:**
    - Jotai atoms for URL state, filters, facets

### Shared Components

Common components live under `search/common/`. Both apps use `ResultsWrapper`,
`SortOptions`, `ErrorBoundary`, and `ResultsError`. KoRe passes its own result
card and sort options into the shared wrapper.
