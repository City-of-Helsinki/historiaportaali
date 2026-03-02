import { atom } from "jotai";
import type URLParams from "./types/URLParams";
import type { SearchFilters, Facet } from "./types/Content";

const getParams = (searchParams: URLSearchParams) => {
  const params: Record<string, string> = {};
  const entries = searchParams.entries();
  let result = entries.next();

  while (!result.done) {
    const [key, value] = result.value;

    if (value) {
      params[key] = value;
    }

    result = entries.next();
  }

  return params;
};

export const urlAtom = atom<URLParams>(
  getParams(new URLSearchParams(window.location.search)),
);

export const urlUpdateAtom = atom(null, (_get, set, values: URLParams) => {
  values.page = values.page || "1";
  set(urlAtom, values);
  set(stagedFiltersAtom, values);

  const newUrl = new URL(window.location.toString());
  const newParams = new URLSearchParams();

  for (const key in values) {
    const value = values[key as keyof URLParams];

    if (key === "page" && value === "1") {
      continue;
    }

    if (value) {
      newParams.set(key, value.toString());
    } else {
      newParams.delete(key);
    }
  }

  newUrl.search = newParams.toString();
  window.history.pushState({}, "", newUrl);
});

export const getPageAtom = atom((get) => {
  const urlPage = Number(get(urlAtom)?.page) || 1;
  return urlPage - 1;
});

export const setPageAtom = atom(null, (get, set, pageIndex: number) => {
  const url = get(urlAtom);
  const urlPage = pageIndex + 1;
  set(urlUpdateAtom, { ...url, page: urlPage.toString() });
});

export const stagedFiltersAtom = atom<URLParams>(
  getParams(new URLSearchParams(window.location.search)),
);

const createStringFieldAtom = (field: keyof URLParams) => {
  const getAtom = atom((get) => get(stagedFiltersAtom)?.[field] || "");
  const setAtom = atom(null, (get, set, value: string) => {
    set(stagedFiltersAtom, { ...get(stagedFiltersAtom), [field]: value });
  });
  return { getAtom, setAtom };
};

const keywords = createStringFieldAtom("q");
export const keywordsAtom = keywords.getAtom;
export const setKeywordsAtom = keywords.setAtom;

const startYear = createStringFieldAtom("startYear");
export const startYearAtom = startYear.getAtom;
export const setStartYearAtom = startYear.setAtom;

const endYear = createStringFieldAtom("endYear");
export const endYearAtom = endYear.getAtom;
export const setEndYearAtom = endYear.setAtom;

const typeFilter = createStringFieldAtom("type");
export const typeFilterAtom = typeFilter.getAtom;
export const setTypeFilterAtom = typeFilter.setAtom;

const languageFilter = createStringFieldAtom("language");
export const languageFilterAtom = languageFilter.getAtom;
export const setLanguageFilterAtom = languageFilter.setAtom;

export const searchFiltersAtom = atom<SearchFilters>((get) => {
  const params = get(urlAtom);
  return {
    keywords: params.q || "",
    startYear:
      params.startYear !== undefined && params.startYear !== ""
        ? Number.parseInt(params.startYear)
        : undefined,
    endYear:
      params.endYear !== undefined && params.endYear !== ""
        ? Number.parseInt(params.endYear)
        : undefined,
    kore_type: params.type || undefined,
    kore_language: params.language || undefined,
    sort: params.sort || "relevance",
    sort_order: params.sort_order || "ASC",
  };
});

export const resetFormAtom = atom(null, (_get, set) => {
  set(stagedFiltersAtom, {});
  set(urlUpdateAtom, {});
});

export const initializedAtom = atom(false);

export const facetsAtom = atom<Facet[]>([]);
export const isLoadingFacetsAtom = atom(false);
