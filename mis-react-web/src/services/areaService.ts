import api from './getAPI';

export const areaService = {
    getAllArea: async () => {
        const response = await api.get ('/areas');

        return response.data;
    },

    createArea: async (createdData: any) => {
        const response = await api.post ('/areas', createdData);

        return response.data;
    },

    updateArea: async (ID: number, updatedData: any) => {
        const response = await api.put (`/areas/${ID}`, updatedData);

        return response.data;
    },
};