import type React from "react";
import { SortOptions as SharedSortOptions } from "../../../common/components/SortOptions";
import { urlAtom, urlUpdateAtom } from "../store";

export const SortOptions: React.FC = () => (
  <SharedSortOptions
    urlAtom={urlAtom}
    urlUpdateAtom={urlUpdateAtom}
    options={["relevance", "year", "created"]}
    context="Search"
  />
);

export default SortOptions;
