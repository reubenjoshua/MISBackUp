import { useEffect } from "react";

import { useSearchBar } from "@/hooks/searchBarHook";
import { SearchProps } from "@/models/types/Filters";
import { BaseColumns } from "@/models/types/ObjectInterfaces";
import { ResultMap } from "./returnResult";
import { camelCaseToLower } from "@/helpers/stringUtils";


export const SearchBar = (
    {
        data,
        searchConfig,
        placeholder,
        onChange,
    }: SearchProps & {
        data:       any [];
        onChange?:  (filtered: any [], query: string) => void;
    }
) => {
    const { query, setQuery, filteredResults } = useSearchBar (data, searchConfig);

    useEffect (() => {
        if (onChange)
        { onChange (filteredResults, query); }
    }, [filteredResults, query]);

    return (
        <div className = "search-component w-full max-w-md mx-auto">
            {  
                <input
                    type = "text"
                    value = { query }
                    onChange = { (e) => setQuery (e.target.value) }
                    placeholder = { placeholder || `Search by ${searchConfig.map(camelCaseToLower).join (", ")}` } //
                    className = "min-w-65 max-w-80 px-2 py-1 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14973F] transition"
                />
            }
        </div>
    );
};

export const SearchBarResult = <T extends object>(
    {
        results,
        query,
        columns,
    }: {
        results:        T [];
        query:          string;
        columns:        BaseColumns <keyof T> [];
    }
) => {
    return <ResultMap
        results = { results }
        columns = { columns }
        message = {
            query.trim () !== ""                // if (query.trim () !==)
                ? "No matching results found"   // { message }
                : "No results"                  // else { message }
        }
    />;
};