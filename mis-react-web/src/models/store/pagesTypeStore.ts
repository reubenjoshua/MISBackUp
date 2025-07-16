import {
    DashboardType,
} from "../types/Pages";


export type DashboardStore = {
    data:               DashboardType | null;
    loading:            boolean;
    error:              string | null;
    isFetching:         boolean;
    fetchDashboard:     () => Promise <void>;
    refreshDashboard:   () => Promise <void>;
};