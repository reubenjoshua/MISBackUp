import { create } from "zustand";
import { authService } from "@/services/authService";
import { useUserStore } from "@/zustand/userStore";
import { useBreadcrumbStore } from "@/zustand/breadcrumbStore";

interface AuthState
{
    user:               any | null;
    loading:            boolean;
    setUser:            (user: any | null) => void;
    // setLoading:         (loading: boolean) => void;

    fetchCurrentUser:   () => Promise <void>;
    logout:             () => void;
};

export const useAuthStore = create <AuthState> ((set) => (
    {
        user:       null,
        loading:    false,

        setUser:    (user) => set ({ user }),
        // setLoading: (loading) => set ({ loading }),

        fetchCurrentUser: async () => {
            set ({ loading: true });

            try
            {
                const response = await authService.getCurrentUser ();
                console.log ("Fetched user: ", response);

                set ({ user: response.data, loading: false });
            }
            catch (err)
            {
                console.error ("Unable to fetch user: ", err);

                set ({ user: null, loading: false });
            }
        },

        logout: () => {
            authService.logout ();

            // Clear all page states when logging out
            const { clearAllPageStates } = useBreadcrumbStore.getState();
            clearAllPageStates();

            set ({ user: null });

            useUserStore.getState().reset();
        },
    })
);