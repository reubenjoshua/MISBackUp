import { useAuthStore } from "@/context/authStore";
import { useUserStore } from "@/zustand/userStore";
import { useBreadcrumbStore } from "@/zustand/breadcrumbStore";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create (
    {
        baseURL: API_BASE,
        headers:
        { 'Content-Type' : 'application/json', }
    },
);


api.interceptors.request.use ((config) => {
    const token = localStorage.getItem ('token');

    if (token)
    { config.headers.Authorization = `Bearer ${token}`; }

    

    return config;
});

api.interceptors.response.use (
    (response) => {
        

        return response;
    },
    (error) => {
        const { response, config } = error;

        console.error ('API Error: ', {
            url:        config?.url,
            method:     config?.method,
            status:     response?.status,
            data:       response?.data,
            message:    error.message
        });

        if (response?.status === 401)
        {
            console.warn ("Unauthorized");

            const authStore = useAuthStore.getState ();
            const userStore = useUserStore.getState ();
            const breadcrumbStore = useBreadcrumbStore.getState ();

            // Clear all page states when unauthorized
            breadcrumbStore.clearAllPageStates();

            authStore.setUser (null);
            userStore.reset ();

            localStorage.removeItem ('token');

            window.location.href = "/mis/login";
        }

        return Promise.reject (error);
    }
);

export default api;