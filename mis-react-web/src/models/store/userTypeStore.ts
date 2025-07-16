import {
    // UserTokenType,
    UserLoginType,
    UserRegistrationType,
    UsersProfileType,
    SingleUserType,
    RoleType,
    UsersProfileKey,
} from "../types/User";

import {
    AreaType,
    BranchType,
} from "../types/Places";


export type AuthStore = {
    token:      string | null;
    user:       SingleUserType | null;
    loading:    boolean;
    error:      string | null;
    login:      (credentials: UserLoginType) => Promise <{
        success: boolean;
        user?: SingleUserType;
        error?: string }>;
    setUser:    (user: SingleUserType) => void;
    loggedIn:   boolean;
    setLoggedIn:(value: boolean) => void;
    // instead of 'logout'
    reset:      (navigate?: (path: string) => void) => void;
};

export type UserRegistrationStore = {
    form:       UserRegistrationType;
    submission: boolean;
    error:      string | null;
    submit:     () => Promise <void>;
};

export type UserProfileStore = {
    profile:        SingleUserType | null;
    loading:        boolean;
    error:          string | null;

    userRole:       RoleType | null;
    userArea:       AreaType | null;
    userBranch:     BranchType | null;

    fetchProfile:   () => Promise <void>;
};

export type UsersListStore = {
    users:      UsersProfileType [];
    loading:    boolean;
    error:      string | null;
    fetchUsers: () => Promise <void>;

    isActive:   (userId: number, newStatus: boolean) => Promise<{ success: boolean; error?: string }>;
    createUser: (userData: UserRegistrationType) => Promise<{ success: boolean; user?: any; error?: string}>;
};

export type RoleStore = {
    roles:      RoleType [];
    loading:    boolean;
    error:      string | null;
    fetchRoles: () => Promise <void>;
};