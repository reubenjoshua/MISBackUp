import api from "./getAPI";

export const pageService = {
    getDashboard: async () => {
        const response = await api.get ('/dashboard-stats');

        return response.data;
    },
};