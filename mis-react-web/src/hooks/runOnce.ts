import { useEffect, useRef } from "react";
import { RunOnceOptions } from "@/models/types/Pages";

export const useRunOnce = (
    callback:   () => void,
    options?:   RunOnceOptions,
) => {
    const hasFetched = useRef (false);
    const dependencies = options?.dependency ?? [];

    useEffect (() => {
        if (!hasFetched.current)
        {
            callback ();

            hasFetched.current = true;
        }
    }, dependencies);
};