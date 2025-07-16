import api from "./getAPI";

export const statusService = {
    getAllStatus: async () => {
        const response = await api.get ('/status');

        return response.data;
    },
};