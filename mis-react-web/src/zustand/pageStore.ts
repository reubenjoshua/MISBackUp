import { create } from "zustand";

import { pageService } from "@/services/pageService";

import type {
    DashboardStore,
} from '../models/store/pagesTypeStore';

// for multiple variable types
type PagesStore = DashboardStore;


export const usePagesStore = create <PagesStore> ((set, get) => (
    {
        loading:    false,
        error:      null,
        isFetching: false,

        data: null,
        fetchDashboard: async () => {
            if (get().isFetching) { return; }

            set ({ loading: true, error: null, isFetching: true });

            try
            {
                const dashboardDB = await pageService.getDashboard ();

                set ({ data: dashboardDB, loading: false, isFetching: false });
            }
            catch (err)
            {
                const errorMessage = err instanceof Error ? err.message : String (err);

                set ({ error: errorMessage, loading: false, isFetching: false });
            }
        },

        refreshDashboard: async () => {
            await get().fetchDashboard();
        },
    }),
);
