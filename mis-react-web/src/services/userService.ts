import { UserRegistrationStore } from "@/models/store/userTypeStore";
import type { UserRegistrationType } from "@/models/types/User";
import api from "./getAPI";

export const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        
        return response.data;
    },

    getAllUsers: async () => {
        const response = await api.get('/users');
        
        return response.data;
    },

    toggleUserActive: async (userId: number) => {
        const response = await api.put(`/users/${userId}/toggle-active`);
        return response.data;
    },

    createUser: async (userData: UserRegistrationType) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // New methods for profile management
    updateProfile: async (profileData: {
        roleName: string;
        username: string;
        firstName: string;
        lastName: string;
    }) => {
        const response = await api.put('/user/profile/update', profileData);
        return response.data;
    },

    changePassword: async (passwordData: {
        password: string;
        confirmPassword: string;
    }) => {
        const response = await api.put('/user/password/change', passwordData);
        return response.data;
    },

    getAreas: async () => {
        const response = await api.get('/areas');
        return response.data;
    },

    getBranches: async () => {
        const response = await api.get('/branches');
        return response.data;
    }
};

