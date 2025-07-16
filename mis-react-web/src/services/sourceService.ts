import api from "./getAPI";

export const sourceTypeService = {
    getAllSourceType: async () => {
        const response = await api.get ('/source-types');

        return response.data;
    },
    
};

export const sourceNameService = {
    getAllSourceName: async (sourceTypeId?: number, userRole?: number) => {
        const params = sourceTypeId ? { sourceTypeId } : {};
        
        // If user is branch admin (role 3) or encoder (role 4), use the branch-specific endpoint
        if (userRole === 3 || userRole === 4) {
            const response = await api.get('/my-branch/source-names', { params });
            return response.data;
        } else {
            // For super admins and central admins, use the general endpoint
            const response = await api.get('/source-names', { params });
            return response.data;
        }
    },

    createSourceName: async (createdData: any) => {
        const response = await api.post ('/source-names', createdData);

        return response.data;
    },

    updateSourceName: async (ID: number, updatedData: any) => {
        const response = await api.put (`/source-name/${ID}`, updatedData);

        return response.data;
    },
    // renameSourceName: (id, newName) => 
    //     api.put(`/api/source-name/${id}`, { sourceName: newName}),
};