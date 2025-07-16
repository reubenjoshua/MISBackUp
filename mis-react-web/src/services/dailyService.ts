import api from "./getAPI";

export const dailyService = {
    getAllDaily: async () => {
        const response = await api.get ('/daily');

        return response.data;
    },

    createDaily: async (createdData: any) => {
        const response = await api.post ('/daily', createdData);

        return response.data;
    },

    updateDaily: async (ID: number, updatedData: any) => {
        const response = await api.put (`/daily/${ID}`, updatedData);

        return response.data;
    },
};