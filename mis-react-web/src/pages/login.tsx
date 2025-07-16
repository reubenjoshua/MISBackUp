import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { UserLoginType } from '@/models/types/User';
import { useUserStore } from '@/zustand/userStore';
import { useAuthStore } from '@/context/authStore';
import { loginValidation } from '@/models/schema/validation';


export default function Login ()
{
    const navigate = useNavigate();
    const { login, loading, error, fetchProfile } = useUserStore ();
    const user = useUserStore (state => state.user);
    const loggedIn = useUserStore (state => state.loggedIn);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm <UserLoginType> ({ resolver: yupResolver (loginValidation) });

    if (user && loggedIn)
    { return <Navigate to = "/dashboard" replace /> }

    const handleLogin = async (formData: UserLoginType) => {
        try
        {
            const result = await login ({
                identifier: formData.identifier,
                password:   formData.password,
            });

            console.log ("Login result: ", result);

            if (result.success && result.user)
            {
                await fetchProfile ();

                const user = useUserStore.getState().user;
                useAuthStore.getState().setUser(user);

                console.log ("User after fetchProfile(): ", useUserStore.getState().user);
                
                toast.success ("Login success");

                navigate ("/dashboard", { replace: true });
            }
            else
            { toast.error (error || "Login failed"); }
        }
        catch (err)
        {
            toast.error ('Unexpected error during login.');
            console.error ('Login error: ', err);
        }
    };

    return (
        <div className = "login-container flex justify-center items-center h-screen bg-[#f5f7fa]">
            <div className = "login-card py-10 px-8 md:w-sm w-2xs rounded-sm bg-white shadow-md">
                <h2 className = "mb-4 text-2xl text-center text-(--primary-color)">
                    Management Information System
                </h2>
                
                <form
                    onSubmit = { handleSubmit(handleLogin) }
                    className = "login-form flex flex-col">
                    <div className = "">
                        <div className = "form-group my-4">
                            <Label htmlFor = "identifier" className = "my-2">
                                Email or Username
                            </Label>
                            <Input
                                id = "identifier"
                                type = "text"
                                placeholder = "Enter your username or email"
                                className = { errors.identifier ? "border-red-500" : "" }
                                { ...register("identifier") }
                            />
                            {errors.identifier && (
                                <p className = "text-red-500 text-sm mt-1">{ errors.identifier.message }</p>
                            )}
                        </div>
                        <div className = "form-group my-4">
                            <Label htmlFor = "password" className = "my-2">
                                Password
                            </Label>
                            <Input
                                id = "password"
                                type = "password"
                                placeholder = "Enter your password"
                                className = { errors.password ? "border-red-500" : "" }
                                { ...register("password") }
                            />
                            {errors.password && (
                                <p className = "text-red-500 text-sm mt-1">{ errors.password.message }</p>
                            )}
                        </div>
                        <div className = "flex flex-col">
                            <Button 
                                type = "submit" 
                                className = "mt-4"
                                disabled = { loading }
                            >
                                {loading ? (
                                    <div className = "flex justify-center items-center">
                                        <div className = "flex space-x-2">
                                            <div className = "h-2.5 w-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className = "h-2.5 w-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className = "h-2.5 w-2.5 bg-white rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
