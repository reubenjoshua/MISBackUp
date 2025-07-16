import api from "./getAPI";

export const roleService = {
    getAllRoles: async () => {
        const response = await api.get ('/roles');

        return response.data;
    },
};