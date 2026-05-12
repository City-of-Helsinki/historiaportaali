import { atom } from "jotai";
import type URLParams from "./types/URLParams";
import type { SearchFilters, Facet } from "../../common/types/Content";

// Parse URL parameters into an object that handles arrays
const getParams = (searchParams: URLSearchParams) => {
  const params: Record<string, string | string[]> = {};
  const entries = searchParams.entries();
  let result = entries.next();

  while (!result.done) {
    const [key, value] = result.value;

    if (!value) {
      result = entries.next();
    } else {
      const existing = params[key];
      if (existing) {
        const updatedValue = Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
        params[key] = updatedValue;
      } else {
        // Check if this is an array parameter (formats, phenomena, neighbourhoods)
        if (["formats", "phenomena", "neighbourhoods"].includes(key)) {
          params[key] = [value];
        } else {
          params[key] = value;
        }
      }

      result = entries.next();
    }
  }

  return params;
};

// Initialize from URL parameters
export const urlAtom = atom<URLParams>(
  getParams(new URLSearchParams(window.location.search)),
);

const normalizeUrlValues = (values: URLParams): URLParams => ({
  ...values,
  page: values.page || "1",
});

const pushUrlToHistory = (values: URLParams) => {
  const newUrl = new URL(window.location.toString());
  const newParams = new URLSearchParams();

  for (const key in values) {
    const value = values[key as keyof URLParams];

    // Skip page parameter if it's 1 (default page)
    if (key === "page" && value === "1") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const option of value) {
        newParams.append(key, option);
      }
    } else if (value) {
      newParams.set(key, value.toString());
    } else {
      newParams.delete(key);
    }
  }

  newUrl.search = newParams.toString();
  window.history.pushState({}, "", newUrl);
};

// Atom to update URL and sync state
export const urlUpdateAtom = atom(null, (_get, set, values: URLParams) => {
  const normalized = normalizeUrlValues(values);
  set(urlAtom, normalized);
  set(stagedFiltersAtom, normalized);
  pushUrlToHistory(normalized);
});

// Atom to update URL without syncing staged form state
const urlOnlyUpdateAtom = atom(null, (_get, set, values: URLParams) => {
  const normalized = normalizeUrlValues(values);
  set(urlAtom, normalized);
  pushUrlToHistory(normalized);
});

// Read-only atom for getting current page (0-based)
export const getPageAtom = atom((get) => {
  const urlPage = Number(get(urlAtom)?.page) || 1;
  return urlPage - 1; // Convert 1-based URL to 0-based internal
});

export const setPageAtom = atom(null, (get, set, pageIndex: number) => {
  const url = get(urlAtom);
  const urlPage = pageIndex + 1; // Convert 0-based to 1-based for URL
  set(urlOnlyUpdateAtom, { ...url, page: urlPage.toString() });
});

// Staged filters atom for form input (not yet submitted)
export const stagedFiltersAtom = atom<URLParams>(
  getParams(new URLSearchParams(window.location.search)),
);

// Submit currently staged filters using latest atom value at write-time.
export const submitFiltersAtom = atom(null, (get, set) => {
  const { page, ...filtersWithoutPage } = get(stagedFiltersAtom);
  set(urlUpdateAtom, { ...filtersWithoutPage, page: "1" });
});

// Helper to create string field atoms
const createStringFieldAtom = (field: keyof URLParams) => {
  const getAtom = atom((get) => get(stagedFiltersAtom)?.[field] || "");
  const setAtom = atom(null, (get, set, value: string) => {
    set(stagedFiltersAtom, { ...get(stagedFiltersAtom), [field]: value });
  });
  return { getAtom, setAtom };
};

// Helper to normalize array fields
const normalizeArray = (value: string | string[] | undefined): string[] => {
  return Array.isArray(value) ? value : value ? [value] : [];
};

// Helper to create array field atoms
const createArrayFieldAtom = (field: keyof URLParams) => {
  const getAtom = atom((get) =>
    normalizeArray(
      get(stagedFiltersAtom)?.[field] as string | string[] | undefined,
    ),
  );
  const setAtom = atom(null, (get, set, value: string[]) => {
    set(stagedFiltersAtom, { ...get(stagedFiltersAtom), [field]: value });
  });
  return { getAtom, setAtom };
};

// Keywords atoms
const keywords = createStringFieldAtom("q");
export const keywordsAtom = keywords.getAtom;
export const setKeywordsAtom = keywords.setAtom;

// Year range atoms
const startYear = createStringFieldAtom("startYear");
export const startYearAtom = startYear.getAtom;
export const setStartYearAtom = startYear.setAtom;

const endYear = createStringFieldAtom("endYear");
export const endYearAtom = endYear.getAtom;
export const setEndYearAtom = endYear.setAtom;

// Array filter atoms
const phenomena = createArrayFieldAtom("phenomena");
export const phenomenaAtom = phenomena.getAtom;
export const setPhenomenaAtom = phenomena.setAtom;

const formats = createArrayFieldAtom("formats");
export const formatsAtom = formats.getAtom;
export const setFormatsAtom = formats.setAtom;

const neighbourhoods = createArrayFieldAtom("neighbourhoods");
export const neighbourhoodsAtom = neighbourhoods.getAtom;
export const setNeighbourhoodsAtom = neighbourhoods.setAtom;

// Sort atoms
const sort = createStringFieldAtom("sort");
export const sortAtom = sort.getAtom;
export const setSortAtom = sort.setAtom;

// Helper to convert URLParams to SearchFilters
export const searchFiltersAtom = atom<SearchFilters>((get) => {
  const params = get(urlAtom);
  return {
    keywords: params.q || "",
    startYear:
      params.startYear !== undefined && params.startYear !== ""
        ? Number.parseInt(params.startYear, 10)
        : undefined,
    endYear:
      params.endYear !== undefined && params.endYear !== ""
        ? Number.parseInt(params.endYear, 10)
        : undefined,
    formats: normalizeArray(params.formats),
    phenomena: normalizeArray(params.phenomena),
    neighbourhoods: normalizeArray(params.neighbourhoods),
    sort: params.sort || "relevance",
    sort_order: params.sort_order || "DESC",
  };
});

// Reset form atom
export const resetFormAtom = atom(null, (_get, set) => {
  set(urlOnlyUpdateAtom, {});
  set(stagedFiltersAtom, {});
});

// Initialization tracking atom (for scroll behavior)
export const initializedAtom = atom(false);

// Facets atom (shared between ResultsContainer and SearchForm)
export const facetsAtom = atom<Facet[]>([]);
export const isLoadingFacetsAtom = atom(false);
