import api from './getAPI';

export const dashboardService = {
    getBranchStats: async () => {
        const response = await api.get('/branch-dashboard-stats');
        return response.data;
    },
    getEncoderStats: async () => {
        const response = await api.get('/encoder-dashboard-stats');
        return response.data;
    },
    getApprovalCounts: async () => {
        try {
            const response = await api.get('/approval-counts');
            return response.data;
        } catch (error) {
            console.error('Error fetching approval counts:', error);
            throw error;
        }
    }
}

