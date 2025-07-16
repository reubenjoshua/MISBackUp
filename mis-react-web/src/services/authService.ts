import api from "./getAPI";
import { isEmailFormat } from "@/helpers/validationUtils";

export const authService = {
    login: async (identifier: string, password: string): Promise <{ token: string, user: any }> => {
        const loginPayload = isEmailFormat (identifier)
            ? { email: identifier, password }
            : { username: identifier, password };
        
        const response = await api.post ('/auth/login', loginPayload);
        const { token, user } = response.data;

        if (!token || !user)
        { throw new Error ('Invalid login response'); }

        return { token, user};
    },

    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        
        return response.data;
    },

    getCurrentUser: async (): Promise <any> => {
        const response = await api.get ('/user/profile');

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};