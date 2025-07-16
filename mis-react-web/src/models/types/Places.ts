export type AreaType = {
    id:         number;
    areaCode?:  number;
    areaName:   string;
    isActive?:  boolean;
    branches?:  BranchType [];
}

export type BranchType = {
    id:         number;
    // branchCode: number;
    branchName: string;
    areaId:     number;
    isActive:   boolean;
}