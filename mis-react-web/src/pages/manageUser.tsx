import { useEffect, useState } from "react";
import clsx from "clsx";

import { useUserStore } from "@/zustand/userStore";
import { DataTableColumns } from "@/models/types/ObjectInterfaces";
import { access } from "@/helpers/accessible";
import { PlacesSelect } from "@/components/filter/placesSelect";
import { SearchBar, SearchBarResult } from "@/components/filter/searchBar";
import { Tabs, tabSelect, TabsResult } from "@/components/filter/tabs";
import { UsersProfileType } from "@/models/types/User";
import { useRunOnce } from "@/hooks/runOnce";
import { usePageState } from "@/hooks/usePageState";
import { activityAreaStyle, textStyles } from "@/assets/styles";
import AddUserModal from "../components/AddUserModal";
import { areaService } from "@/services/areaService";
import { roleService } from "@/services/roleService";
import { branchService } from "@/services/branchService";



const columns: DataTableColumns[] = [
    { label: 'First Name',      valueKey: 'firstName',      roleID: access.approver },
    { label: 'Last Name',       valueKey: 'lastName',       roleID: access.approver },
    { label: 'Email',           valueKey: 'email',          roleID: access.approver },
    { label: 'Area',            valueKey: 'areaName',       roleID: access.execs },
    { label: 'Branch',          valueKey: 'branchName',     roleID: access.execs },
    { label: 'Role',            valueKey: 'roleName',       roleID: access.approver },
    { label: 'Active',          valueKey: 'isActive',       roleID: access.approver },
    { label: 'Username',        valueKey: 'userName',       roleID: access.approver },
    {
        label:      'Action',
        valueKey:   'actions',
        roleID:     access.approver,
        button:     (user) => (
                <div>
                    {/* <button onClick = { () => handleEdit (user) }>Edit</button> */}
                    <button>Edit</button>
                </div>
            ),
    },
];



export default function ManageUser ()
{
    const userData = useUserStore ((state) => state.users);
    const fetchUsers = useUserStore ((state) => state.fetchUsers);
    const currentUser = useUserStore((state) => state.user);

    // Page state management
    const { saveProperty, getProperty } = usePageState();

    const [ area, setArea ] = useState ("");
    const [ branch, setBranch ] = useState ("");

    const [ filteredResults, setFilteredResults ] = useState <any []> ([]);
    const [ query, setQuery ] = useState ("");
    const [displayedUsers, setDisplayedUsers] = useState<UsersProfileType[]>([]);

    // Initialize activeTab with saved state or default
    const [ activeTab, setActiveTab ] = useState <string> (() => {
        const savedTab = getProperty('activeTab');
        console.log('ManageUser - Saved activeTab:', savedTab);
        return savedTab || tabSelect.users[0];
    });
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [areas, setAreas] = useState<{ id: number; areaName: string }[]>([]);
    const [roles, setRoles] = useState<{ id: number; roleName: string}[]>([]);
    const [branches, setBranches] = useState<{ id: number; branchName: string }[]>([]);
    const [togglingUsers, setTogglingUsers] = useState<Set<number>>(new Set());

    // Save activeTab whenever it changes
    useEffect(() => {
        console.log('ManageUser - Saving activeTab:', activeTab);
        saveProperty('activeTab', activeTab);
    }, [activeTab, saveProperty]);

    const handleToggleActive = async (user: UsersProfileType) => {
        console.log('Toggle user:', user); // Debug log
        console.log('User ID:', user.id); // Debug log - using lowercase 'id'
        
        if (togglingUsers.has(user.id)) return; // Prevent multiple clicks
        
        setTogglingUsers(prev => new Set(prev).add(user.id));
        
        try {
            const isActive = useUserStore.getState();
            const result = await isActive.isActive(user.id, !user.isActive);
            
            if (result.success) {
                console.log(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            } else {
                console.error('Failed to toggle user status:', result.error);
            }
        } finally {
            setTogglingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(user.id);
                return newSet;
            });
        }
    };

    useEffect(() => {
        areaService.getAllArea()
            .then(data => setAreas(data))
            .catch(err => console.error(err));
        roleService.getAllRoles()
            .then(data => setRoles(data))
            .catch(err => console.error(err));
        branchService.getAllBranch()
            .then(data => setBranches(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        console.log('User data changed:', userData); // Debug log
        console.log('Active tab:', activeTab); // Debug log
        
        let filtered = userData;
        // Filter for Branch Admins and Encoders
        const isBranchAdmin = currentUser?.roleName === 'Branch Admin'; // roleId 3
        const isEncoder = currentUser?.roleName === 'Encoder'; // roleId 4
        const branchId = currentUser?.branchId;
        if ((isBranchAdmin || isEncoder) && branchId) {
            filtered = filtered.filter(u => u.branchId === branchId);
        }
        if (activeTab === "Active users") {
            filtered = filtered.filter(u => u.isActive);
            console.log('Filtered active users:', filtered); // Debug log
        }
        else if (activeTab === "Inactive users") {
            filtered = filtered.filter(u => !u.isActive);
            console.log('Filtered inactive users:', filtered); // Debug log
        }
        setDisplayedUsers(filtered);
    }, [userData, activeTab, currentUser]);

    useRunOnce (() => {
        fetchUsers ();
    });

    return (
        <main className = { activityAreaStyle.mainTag }>
            <div className = "header-section">
                <h1>Manage Users</h1>
            </div>

            <div className = "filter-section space-y-4">
                <div className = "tier-one flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className = "select-dropdown flex flex-col gap-2 sm:flex-row sm:items-center">
                        <PlacesSelect 
                            selectedArea = { area }
                            onAreaChange = { setArea }
                            selectedBranch = { branch }
                            onBranchChange = { setBranch }
                            
                        />
                    </div>
                    <div className = "search-bar flex-1 min-w-[200px]">
                        <SearchBar
                            data = { displayedUsers }
                            searchConfig = {["email", "firstName"]}
                            onChange = {(results, queryValue) => {
                                setFilteredResults (results);
                                setQuery (queryValue);
                            }}
                        />
                    </div>
                    <div className = "modal-button self-start md:self-auto">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semi-bold px-6 py-2 rounded-lg shadow-transition" onClick={() => setShowAddUserModal(true)}>
                            Add User
                        </button>
                        
                    </div>
                </div>
                <div className = "tier-two flex justify-center">
                    <Tabs
                        tabsConfig = { tabSelect.users }
                        items = { userData }
                        tabType = "users"
                        initialActiveTab = { activeTab }
                        onTabChange = {
                            (tab) =>
                            {
                                setActiveTab (tab);
                                let filtered = userData;
                                if (tab === "Active users") filtered = userData.filter(u => u.isActive);
                                else if (tab === "Inactive users") filtered = userData.filter(u => !u.isActive);
                                setDisplayedUsers(filtered);
                                setFilteredResults([]);
                                setQuery("");
                            }
                        }
                    />
                </div>
            </div>

            <div className = { clsx ("table-section", activityAreaStyle.divTableTag.replace('mx-auto', 'w-full')) }>
                <table className = { activityAreaStyle.tableTag }>
                    <thead>
                        <tr>
                            {
                                columns.filter (col => col.roleID).map (col => (
                                    <th
                                        key = { col.valueKey}
                                        className = { textStyles.tableHeader }>
                                        { col.label }
                                    </th>
                                ))
                            }
                        </tr>
                    </thead>

                    <tbody>
                        {query.trim() !== "" ? (
                            <SearchBarResult
                                results={filteredResults}
                                query={query}
                                columns={columns}
                            />
                        ) : displayedUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan = { columns.length }
                                    className = { textStyles.tableNoResult }
                                >
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            displayedUsers.map((user, index) => (
                                <tr key={index}>
                                    {columns.filter(col => col.roleID).map(col => (
                                        <td
                                            key={col.valueKey}
                                            className={textStyles.tableDisplayData}
                                        >
                                            {col.valueKey === "actions"
                                                ? <button>Edit</button>
                                                : col.valueKey === "isActive" ? (
                                                    <button
                                                        onClick={() => handleToggleActive(user)}
                                                        disabled={togglingUsers.has(user.id)}
                                                        className={`relative w-12 h-6 rounded-full border-2 transition-colors duration-200
                                                            ${user.isActive ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}
                                                            ${togglingUsers.has(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        aria-label={user.isActive ? "Deactivate user" : "Activate user"}
                                                    >
                                                        <span
                                                            className={`absolute left-0 top-1/2 w-6 h-6 rounded-full shadow transform transition-transform duration-200
                                                                ${user.isActive ? 'translate-x-6 bg-green-700' : 'translate-x-0 bg-gray-700'} -translate-y-1/2`}
                                                        />
                                                    </button>
                                                ) : user[col.valueKey as keyof UsersProfileType]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <AddUserModal
                show={showAddUserModal}
                onClose={() => setShowAddUserModal(false)}
                onSubmit={(success) => {
                    setShowAddUserModal(false);
                    if (success) {
                        // Optionally show a success message
                        console.log('User created successfully');
                    }
                }}
                areas={areas}
                roles={roles}
                branches={branches}
            />
        </main>
    );
};