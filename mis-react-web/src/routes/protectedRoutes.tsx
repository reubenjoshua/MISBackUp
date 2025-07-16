import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/context/authStore';

interface Props
{
    children: React.ReactNode;
}

const ProtectedRoutes = ({ children }: Props) => {
    const location = useLocation();
    const user = useAuthStore ((state) => state.user);
    const loading = useAuthStore ((state) => state.loading);
    const fetchUser = useAuthStore.getState().fetchCurrentUser;

    useEffect (() => {
        if (!user && !loading)
            { fetchUser(); }
    }, [user, loading]);

    if (loading)
    {
        return (
            <div className = "flex justify-center items-center">
                <div className = "flex space-x-2">
                    <div className = "h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className = "h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className = "h-2.5 w-2.5 bg-primary rounded-full animate-bounce"></div>
                </div>
            </div>
        );
    }

    if (!user)
    {
        return <Navigate to = "/login" state = {{ from: location }} replace />;
    }

    return <>{ children }</>;
};

export default ProtectedRoutes;