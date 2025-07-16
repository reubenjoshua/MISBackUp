import { useMemo, useState } from "react";
import { ItemSearch } from "@/models/types/Filters";
import { useDebouncedValue } from "@/helpers/debounce";

export const useSearchBar = (
    data:           ItemSearch [],
    searchFields:   string [] = [],
) => {
    const [query, setQuery] = useState ("");
    const debouncedQuery = useDebouncedValue (query, 300);
    const toLowerQuery = debouncedQuery.toLowerCase ();

    const filteredResults = useMemo (() => {
        if (!debouncedQuery.trim ())
        { return data; }
        
        return data.filter ((item) =>
            searchFields.some ((field) => {
                const value = item [field];

                return value?.toString().toLowerCase().includes (toLowerQuery);
            })
        );
    }, [debouncedQuery, data, searchFields]);

    return {
        query,
        setQuery,
        filteredResults,
    };
};