import api from "./getAPI";

export const monthlyService = {
    getAllMonthly: async () => {
        const response = await api.get ('/monthly');

        return response.data;
    },

    createMonthly: async (createdData: any) => {
        const response = await api.post (`/monthly`, createdData);

        return response.data;
    },

    updateMonthly: async (ID: number, updatedData: any) => {
        const response = await api.put (`/monthly/${ID}`, updatedData);

        return response.data;
    },
};