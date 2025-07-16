import { useState } from "react";


export const useTab = (initialTab: readonly string[] = [], initialActiveTab?: string) => {
    const [ activeTab, setActiveTab ] = useState <string> (initialActiveTab || initialTab[0] || "");

    const changeTab = (tab: string) => {
        setActiveTab (tab);
    };

    return { activeTab, changeTab, };
};

export const isActiveLogic = (
    item:       { isActive: boolean },
    activeTab:  string,
    type:       "users" | "branches",
) => {
    const active = Boolean (item.isActive);

    switch (activeTab)
    {
        case `All ${ type }`:
            return true;
        case `Active ${ type }`:
            return active === true;
        case `Inactive ${ type }`:
            return active === false;
        default:
            return true;
    }
};

export const dataSheetLogic = (
    item:       { status: number },
    activeTab:  string,
) => {
    switch (activeTab)
    {
        case "All datasheet":
            return true;
        case "Approved":
            return item.status === 1;
        case "Pending":
            return item.status === 2;
        case "Declined":
            return item.status === 3;
        default:
            return true;
    }
};