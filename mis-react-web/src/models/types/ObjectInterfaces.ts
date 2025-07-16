import { SvgIconComponent } from "@mui/icons-material";
import { DashboardKey } from "./Pages";
import { UsersProfileKey, UsersProfileType } from "./User";


export interface BaseColumns <T>
{
    label:      string;
    valueKey?:  T;
    roleID?:    number [];

    button?:    (cell: any) => React.ReactNode;
}

export interface NavItems extends Omit <BaseColumns <any>, 'valueKey'>
{
    path:   string;
};

export interface NavSection
{
    header: string;
    items:  NavItems [];
};

export interface DashboardItems extends BaseColumns <DashboardKey>
{
    icon:       SvgIconComponent;
};

export interface DataTableColumns extends BaseColumns <UsersProfileKey> {};