import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbStore } from "@/zustand/breadcrumbStore";

export default function TopTab() {
    const navigate = useNavigate();
    const location = useLocation();
    const { breadcrumbs, navigateToBreadcrumb } = useBreadcrumbStore();

    

    const handleBreadcrumbClick = (breadcrumbId: string) => {
        console.log('TopTab - Clicking breadcrumb:', breadcrumbId);
        navigateToBreadcrumb(breadcrumbId);
        // Navigate to the path
        const targetBreadcrumb = breadcrumbs.find(b => b.id === breadcrumbId);
        if (targetBreadcrumb) {
            console.log('TopTab - Navigating to:', targetBreadcrumb.path);
            navigate(targetBreadcrumb.path);
        }
    };

    const handleHomeClick = () => {
        console.log('TopTab - Clicking home');
        navigate('/dashboard');
    };

    return (
        <div className="topBar-Container h-10 bg-[#D9D9D9] rounded-xl flex items-center justify-start p-2">
            <div className="flex items-center space-x-2 text-sm">
                {/* Home button */}
                <button
                    onClick={handleHomeClick}
                    className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                    <Home size={16} />
                    <span>Dashboard</span>
                </button>

                {/* Breadcrumbs */}
                {breadcrumbs.map((breadcrumb) => (
                    <React.Fragment key={breadcrumb.id}>
                        <ChevronRight size={16} className="text-gray-500" />
                        <button
                            onClick={() => handleBreadcrumbClick(breadcrumb.id)}
                            className={`px-2 py-1 rounded transition-colors ${
                                breadcrumb.isActive
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            {breadcrumb.label}
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}