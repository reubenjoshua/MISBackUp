import { create } from 'zustand';

import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { useBreadcrumbStore } from './breadcrumbStore';
// import { areaService } from '@/services/areaService';
// import { branchService } from '@/services/api';

import { SingleUserType, UserRegistrationType, /* UsersProfileType,RoleType*/ } from '@/models/types/User';
// import { AreaType, BranchType } from '@/models/types/places';

import type {
    AuthStore,
    UserProfileStore,
    UsersListStore,
    RoleStore,
} from '@/models/store/userTypeStore';

type UserStore = AuthStore & UserProfileStore & UsersListStore & RoleStore;

export const useUserStore = create <UserStore> ((set) => (
    {
        token:      localStorage.getItem ('token'),
        user:       localStorage.getItem ('user')
                    ? JSON.parse (localStorage.getItem ('user')!)
                    : null,
        userRole:   null,
        userArea:   null,
        userBranch: null,
        loading:    false,
        error:      null,

        loggedIn:   false,
        setLoggedIn:(value: boolean) => set ({ loggedIn: value }),

        login: async ({ identifier, password }) => {
            set ({ loading: true, error: null });

            try
            {
                const response = await authService.login (identifier, password);

                localStorage.setItem ('token', response.token);
                localStorage.setItem ('user', JSON.stringify (response.user));

                set ({ token: response.token, user: response.user, loading: false });

                return { success: true, user: response.user };
            }
            catch (error: any)
            {
                const message = error.response?.data?.message || 'Login failed';

                set ({ error: message, loading: false });
                
                return { success: false, error: message };
            }
        },

        setUser: (user: SingleUserType) => {
            localStorage.setItem ('user', JSON.stringify (user));

            set ({ user });
        },

        profile: null,
        fetchProfile: async () => {
            set ({ loading: true, error: null });

            try
            {
                const profile = await userService.getProfile ();
                // const roles = await roleService.getAllRoles ();
                // const areas = await areaService.getAllArea ();
                // const branches = await branchService.getAllBranches ();

                // const userRole = roles.find ((r: RoleType) => r.Id === profile.Role) || null;
                // const userArea = areas.find ((a: AreaType) => a.Id === profile.Area) || null;
                // const userBranch = branches.find ((b: BranchType) => b.Id === profile.Branch) || null;

                localStorage.setItem('user', JSON.stringify(profile));
set({ user: profile, profile, loading: false });
            }
            catch (err)
            { set ({ error: 'Failed to fetch profile', loading: false }); }
        },

        users: [],
        fetchUsers: async () => {
            set ({ loading: true, error: null });

            try
            {
                const users = await userService.getAllUsers ();

                set ({ users, loading: false });
            }
            catch (err)
            { set ({ error: 'Failed to fetch all users', loading: false }); }
        },

        roles: [],
        fetchRoles: async () => {
            set ({ loading: true, error: null });

            try
            {
                const roles = await roleService.getAllRoles ();

                set ({ roles, loading: false });
            }
            catch (error: any)
            { set ({ error: 'Failed to fetch role', loading: false }); }
        },

        isActive: async (userId: number, newStatus: boolean) => {
            console.log('Store: Toggling user', userId, 'to', newStatus); // Debug log
            
            try {
                // Optimistically update the UI first
                set((state) => {
                    const updatedUsers = state.users.map((user) =>
                        user.id === userId
                            ? { ...user, isActive: newStatus }
                            : user
                    );
                    console.log('Store: Optimistic update - Updated users:', updatedUsers); // Debug log
                    return { users: updatedUsers };
                });

                // Make the API call
                const updatedUser = await userService.toggleUserActive(userId);
                console.log('Store: API response:', updatedUser); // Debug log
                
                // Update with the actual response from server
                set((state) => {
                    const finalUsers = state.users.map((user) =>
                        user.id === userId
                            ? { ...user, ...updatedUser }
                            : user
                    );
                    console.log('Store: Final update - Updated users:', finalUsers); // Debug log
                    return { users: finalUsers };
                });

                return { success: true };
            } catch (error: any) {
                console.log('Store: Error occurred:', error); // Debug log
                
                // Revert the optimistic update on error
                set((state) => ({
                    users: state.users.map((user) =>
                        user.id === userId
                            ? { ...user, isActive: !newStatus }
                            : user
                    )
                }));

                const message = error.response?.data?.message || 'Failed to toggle user status';
                set({ error: message });
                
                return { success: false, error: message };
            }
        },

        createUser: async (userData: UserRegistrationType) => {
            set({ loading: true, error: null });
            
            try {
                const response = await userService.createUser(userData);
                
                // Refresh the users list to include the new user
                const users = await userService.getAllUsers();
                set({ users, loading: false });
                
                return { success: true, user: response.user };
            } catch (error: any) {
                const message = error.response?.data?.message || 'Failed to create user';
                set({ error: message, loading: false });
                
                return { success: false, error: message };
            }
        },

        reset: (navigate?: (path: string) => void) => {
            authService.logout ();

            // Clear all page states when logging out
            const { clearAllPageStates } = useBreadcrumbStore.getState();
            clearAllPageStates();

            set ({
                token:      null,
                user:       null,
                users:      [],
                roles:      [],

                profile:    null,
                userRole:   null,
                userArea:   null,
                userBranch: null,
            });

            if (navigate)
            {
                console.log ("To login page");
                setTimeout (() => {
                    window.location.href = "/mis/login";
                }, 50);
            }
        },
    }),
);