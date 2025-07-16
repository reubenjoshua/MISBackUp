export type PlacesSelectProps = {
    selectedArea?:      string;
    onAreaChange?:      (value: string) => void;

    selectedBranch?:    string;
    onBranchChange?:    (value: string) => void;

    disabled?:          boolean;
}

export type ItemSearch = {
    [key: string]:  any;
}

export type SearchProps = {
    data:           any [];
    searchConfig:   string [];
    placeholder?:   string;
    onChange?:      (filtered: any [], query: string) => void;
}

export type TabProps <T = any> = {
    tabsConfig:     readonly string[];
    items:          any [];
    // filterLogic:    (item: any, activeTab: string) => boolean;
    tabType:        "users" | "branches" | "approvals";
    onTabChange?:   (tab: string, filteredItems: T []) => void;
}