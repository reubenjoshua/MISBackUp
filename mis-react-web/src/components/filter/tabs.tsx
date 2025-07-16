import { TabProps } from "@/models/types/Filters";
import { dataSheetLogic, isActiveLogic, useTab } from "@/hooks/tabsHook";
import { BaseColumns } from "@/models/types/ObjectInterfaces";
import { ResultMap } from "./returnResult";

export const tabSelect = {
    users:      ["All users", "Active users", "Inactive users"],
    branches:   ["All branches", "Active branch", "Inactive branch"],
    approvals:  ["All datasheet", "Approved", "Pending", "Declined"],
} as const;

export const Tabs = <T extends object> (
    {
        tabsConfig,
        items,
        tabType,
        onTabChange,
        initialActiveTab,
    }: TabProps <T> & { initialActiveTab?: string }
) => {
    const { activeTab, changeTab } = useTab (tabsConfig, initialActiveTab);

    const getFilterLogic = () => {
        switch (tabType)
        {
            case "users":
            case "branches":
                return (item: any, tab: string) => isActiveLogic (item, tab, tabType);
            case "approvals":
                return (item: any, tab: string) => dataSheetLogic (item, tab);
            default:
                return () => true;
        }
    };

    const filterLogic = getFilterLogic ();

    const handleTabClick = (tab: string) => {
        if (tab === activeTab)
        { return; }
        
        changeTab (tab);

        const filtered = items.filter ((item) => filterLogic (item, tab));

        onTabChange?.(tab, filtered);
    };
    
    return (
        <div className = "tab-component">
            <div className = "tabs-selection flex space-x-4">
                {
                    tabsConfig.map ((tab) => (
                        <button
                            key = { tab }
                            onClick = { () => handleTabClick (tab) }
                            className = { `px-4 ${
                                activeTab === tab
                                    ? "text-[#14973F] underline underline-offset-4"
                                    : "hover:text-[#14973F]"
                                }` }
                            >
                            { tab }
                        </button>
                    ))
                }
            </div>
        </div>
    );
};

export const TabsResult = <T extends object> (
    {
        results,
        activeTab,
    }: {
        results:    T [];
        activeTab:  string;
    }
) => {
    const columns = (results.length > 0
            ? Object.keys (results [0])
            :  []) as (keyof T)[];

    const displayColumns: BaseColumns <keyof T> [] = columns.map ((key) => (
        {
            label:      String (key),
            valueKey:   key,
        }
    ));

    return <ResultMap
        results = { results }
        columns = { displayColumns }
        message = { `${ activeTab } here` }
    />
};