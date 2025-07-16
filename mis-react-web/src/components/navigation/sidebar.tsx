import { NavLink, useNavigate } from "react-router-dom";
import { useUserStore } from "@/zustand/userStore";
import { NavSection } from "@/models/types/ObjectInterfaces";
import { access } from "@/helpers/accessible";

const navSections: NavSection[] = [
    {
        header: "Manage",
        items:
        [
            { label: 'Manage User',     path: '/manage-user',   roleID: access.approver },
            { label: 'Manage Branch',   path: '/manage-branch', roleID: access.execs },
        ]
    },
    {
        header: "Forms",
        items:
        [
            { label: 'Monthly',         path: '/monthly',       roleID: access.all },
            { label: 'Daily',           path: '/daily',         roleID: access.all },
            { label: 'Approve Data',    path: '/approve-data',  roleID: access.approver },
            { label: 'Status',          path: '/status',        roleID: access.staff },
        ]
    },    
    {
        header: "User",
        items:
        [
            { label: 'Profile',         path: '/profile',       roleID: access.all },
        ]
    },
];

export default function Sidebar ()
{
    const { user, reset } = useUserStore ();
    const navigate = useNavigate ();

    if (!user)
    { return <div className = "">No user loaded</div>; }

    const {
        userName = "User",
        roleName = "",
        branchName = "",
        roleId
    } = user;

    

    const isBranchAdmin = roleName === 'Branch Admin';

    const handleSignout = () => {
        reset (navigate);
    };

    return (
        <div className = "sidebar-items-Container flex flex-col justify-between h-full">
            <div className = "main-div-1 user-Information flex flex-col">
                <h1 className = "self-center">
                    Hello {userName?.trim()}!
                </h1>
                <h3 className = "self-center">{roleName}</h3>
                {(roleName === "Branch Admin" || roleName === "Encoder") && branchName && (
                  <h3 className="self-center">{branchName}</h3>
                )}
            </div>

            <div className = "main-div-2 menu-Container">
                <ul>
                    {
                        navSections.map ((section) => {
                            let visibleItems = section.items.filter ((item) => item.roleID.includes (roleId));

                            if (isBranchAdmin && section.header === 'Manage') {
                                if (!visibleItems.some(item => item.path === '/manage-branch')) {
                                    visibleItems = [
                                        ...visibleItems,
                                        { label: 'Manage Branch', path: '/manage-branch', roleID: [] }
                                    ];
                                }
                            }

                            if (visibleItems.length === 0)
                            { return null; }

                            return (
                                <li key = { section.header } className = "menu-Section w-full">
                                    <span className = "menu-Header text-sm py-1">{ section.header }</span>
                                    <ul className = "menu-Items flex flex-col w-full">
                                        {
                                            visibleItems.map ((item) => (
                                                <li key = { item.path } className = "menu-label">
                                                    <NavLink
                                                        to = { item.path }
                                                        className = {({ isActive }) => 
                                                            `flex w-full justify-center rounded-2xl my-0.5 ${ isActive
                                                                ? "bg-[#A3A3A3] py-2"
                                                                : "hover:bg-[#A3A3A3] transition duration-100 py-2" }`
                                                    }>
                                                        <span>{ item.label }</span>
                                                    </NavLink>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>

            <div className = "main-div-3 logout-Button">
                <button
                    onClick = { handleSignout }
                    className = "bg-[#2E2E2E] text-white rounded w-full h-10 hover:bg-[#7f7f7f] hover:text-[#2E2E2E] transition">
                        Sign Out
                </button>
            </div>
        </div>
    );
};