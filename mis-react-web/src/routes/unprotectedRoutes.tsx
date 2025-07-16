import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/context/authStore';

interface Props
{
    children: React.ReactNode;
}

const UnprotectedRoutes = ({ children }: Props) => {
    const location = useLocation();
    const user = useAuthStore ((state) => state.user);
    // const loading = useAuthStore ((state) => state.loading);

    // if (loading)
    // {
    //     return (
    //         <div className = "flex justify-center items-center h-screen">
    //             <div className = "flex space-x-2">
    //                 <div className = "h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    //                 <div className = "h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    //                 <div className = "h-2.5 w-2.5 bg-primary rounded-full animate-bounce"></div>
    //             </div>
    //         </div>
    //     );
    // }

    return user ? (
        <Navigate
            to = "/dashboard"
            state = {{ from: location }}
            replace
        />
    ) : (
        <>{ children }</>
    );
};

export default UnprotectedRoutes;