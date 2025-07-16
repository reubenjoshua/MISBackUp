export type DashboardType = {
    ActiveUsers?:   number;
    Areas?:         number;
    Branches?:      number;
    Pending?:       number;
    Approved?:      number;
    Declined?:      number;
    Encoded?:       number;
}

export type DashboardKey = keyof DashboardType;

export type RunOnceOptions = {
    dependency?:    any [];
}