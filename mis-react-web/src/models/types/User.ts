export type UserTokenType = {
    token:      string;
    user:       string;
}

export type UserLoginType = {
    identifier: string;
    password:   string;
}

export type UserRegistrationType = {
    firstName:  string;
    lastName:   string;
    email:      string;
    password:   string;

    userName:   string;
    roleId:     number;
    areaId?:    number;
    branchId?:  number;
}

// Fetch all users
export type UsersProfileType = {
    id:                 number;
    firstName:          string;
    lastName:           string;
    email:              string;
    userName:           string;
    password?:          string;
    role:               number;

    roleId:             number;
    roleName:           string;
    areaId?:            number;
    areaName?:          string;
    branchId?:          number;
    branchName?:        string;

    isActive:           boolean;
}

// Fetch one profile, one account
export type SingleUserType = {
    id:                 number;
    firstName:          string;
    lastName:           string;
    username:           string;
    email:              string;
    password?:          string;

    roleId:             number;
    roleName:           string;
    areaId?:            number;
    areaName?:          string;
    branchId?:          number;
    branchName?:        string;

    isActive:           boolean;
    monthlyEncoded?:    number;
    dailyEncoded?:      number;
}

export type RoleType = {
    Id:         number;
    roleName:   string;
}

export type UsersProfileKey = keyof UsersProfileType | 'actions';