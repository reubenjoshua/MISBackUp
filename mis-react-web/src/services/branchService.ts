import api from "./getAPI";

export const branchService = {
    getAllBranch: async () => {
        const response = await api.get ('/branches');

        return response.data;
    },

    

    createBranch: async (createdData: any) => {
        const response = await api.post ('/branches', createdData);

        return response.data;
    },

    updateBranch: async (ID: number, updatedData: any) => {
        const response = await api.put (`/branches/${ID}`, updatedData);

        return response.data;
    },

    toggleBranchActive: async (branchId: number) => {
        const response = await api.put(`/branches/${branchId}/toggle-active`);
        return response.data;
    },

    getInactiveBranches: async () => {
        const response = await api.get('/branches/inactive');
        return response.data;
    },
};