import { create } from "zustand";

import { areaService } from "@/services/areaService";
import { branchService } from "@/services/branchService";

import type { PlacesStore } from "@/models/store/placesTypeStore";

export const usePlaceStore = create <PlacesStore> ((set) => (
    {
        areas: [],
        loadingAreas: false,
        errorAreas: null,
        fetchAreas: async () => {
            set ({ loadingAreas: true, errorAreas: null });

            try
            {
                const areas = await areaService.getAllArea ();

                set ({ areas, loadingAreas: false });
            }
            catch (error: any)
            {
                set ({ errorAreas: 'Failed to fetch area', loadingAreas: false });
            }
        },

        branches: [],
        loadingBranches: false,
        errorBranches: null,
        fetchBranches: async () => {
            set ({ loadingBranches: true, errorBranches: null });

            try
            {
                const branches = await branchService.getAllBranch ();

                set ({ branches, loadingBranches: false });
            }
            catch (error: any)
            {
                set ({ errorBranches: 'Failed to fetch branch', loadingBranches: false });
            }
        },

        toggleBranchActive: async (branchId: number, newStatus: boolean) => {
            try {
                // Optimistically update the UI first
                set((state) => ({
                    branches: state.branches.map((branch) =>
                        branch.id === branchId
                            ? { ...branch, isActive: newStatus }
                            : branch
                    )
                }));

                // Make the API call
                const updatedBranch = await branchService.toggleBranchActive(branchId);
                
                // Update with the actual response from server
                set((state) => ({
                    branches: state.branches.map((branch) =>
                        branch.id === branchId
                            ? { ...branch, isActive: updatedBranch.isActive }
                            : branch
                    )
                }));

                return { success: true };
            } catch (error: any) {
                // Revert the optimistic update on error
                set((state) => ({
                    branches: state.branches.map((branch) =>
                        branch.id === branchId
                            ? { ...branch, isActive: !newStatus }
                            : branch
                    )
                }));

                const message = error.response?.data?.message || 'Failed to toggle branch status';
                set({ errorBranches: message });
                
                return { success: false, error: message };
            }
        },

        addBranch: async (branchData) => {
            set({ loadingBranches: true, errorBranches: null });
            try {
        const created = await branchService.createBranch(branchData);
        // Refresh the list after adding
        const branches = await branchService.getAllBranch();
        set({ branches, loadingBranches: false });
        return { success: true, branchId: created.branchId };
    } catch (error: any) {
        set({ errorBranches: 'Failed to add branch', loadingBranches: false });
        return { success: false, error: error.response?.data?.message || 'Failed to add branch' };
    }
        },

        inactiveBranches: [],
        loadingInactiveBranches: false,
        errorInactiveBranches: null,
        fetchInactiveBranches: async () => {
            set({ loadingInactiveBranches: true, errorInactiveBranches: null });
            try {
                const branches = await branchService.getInactiveBranches();
                set({ inactiveBranches: branches, loadingInactiveBranches: false });
            } catch (error: any) {
                set({ errorInactiveBranches: 'Failed to fetch inactive branches', loadingInactiveBranches: false });
            }
        }
    })
);