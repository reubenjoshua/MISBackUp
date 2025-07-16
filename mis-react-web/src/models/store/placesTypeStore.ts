import {
    AreaType,
    BranchType,
} from "../types/Places";


export type PlacesStore = {
    areas:              AreaType [];
    loadingAreas:       boolean;
    errorAreas:         string | null;
    fetchAreas:         () => Promise <void>;

    branches:           BranchType [];
    loadingBranches:    boolean;
    errorBranches:      string | null;
    fetchBranches:      () => Promise <void>;
    toggleBranchActive: (branchId: number, newStatus: boolean) => Promise<{ success: boolean; error?: string }>;
    addBranch: (branchData: any) => Promise<{ success: boolean; error?: string }>;
    inactiveBranches: BranchType[];
    loadingInactiveBranches: boolean;
    errorInactiveBranches: string | null;
    fetchInactiveBranches: () => Promise<void>;
};