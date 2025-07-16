import { useEffect, useState } from "react";
import clsx from "clsx";

import {
    Apartment,
    Cancel,
    CheckCircle,
    Edit,
    HourglassEmpty,
    LocationOn,
    PeopleAlt,
} from "@mui/icons-material";

import { usePagesStore } from "@/zustand/pageStore";
import { DashboardItems } from "@/models/types/ObjectInterfaces";
import { useUserStore } from "@/zustand/userStore";
import { access } from "@/helpers/accessible";
import { activityAreaStyle } from "@/assets/styles";
import { dashboardService } from "@/services/dashboardService";
import ApprovalSummaryModal from "@/components/modal/ApprovalSummaryModal";

export default function DashboardPage()
{
    const currentUser = useUserStore((state) => state.user);
    const [stats, setStats] = useState({
        ActiveUsers: 0,
        Approved: 0,
        TotalPending: 0,
    });

    const [encoderStats, setEncoderStats] = useState({
        Approved: 0,
        Rejected: 0,
        Encoded: 0,
    });

    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [approvalCounts, setApprovalCounts] = useState({ Daily: 0, Monthly: 0 });
    const [loadingApprovalCounts, setLoadingApprovalCounts] = useState(false);

    const { user } = useUserStore();
    const { data, refreshDashboard, loading } = usePagesStore();
    const userRole = user?.roleId;

    useEffect(() => {
        if (currentUser?.roleId === 3) {
            dashboardService.getBranchStats()
                .then(data => setStats(data))
                .catch((error) => {
                    console.error('Error fetching branch stats:', error);
                    setStats({ ActiveUsers: 0, Approved: 0, TotalPending: 0 });
                });
        } else if (currentUser?.roleId === 4) {
            dashboardService.getEncoderStats()
            .then(data => setEncoderStats(data))
            .catch((error) => {
                console.error('Error fetching encoder stats:', error);
                setEncoderStats({ Approved: 0, Rejected: 0, Encoded: 0});
            });
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchIfPresent = () => {
            if (document.visibilityState === "visible") {
                refreshDashboard();
            }
        };

        fetchIfPresent();

        const interval = setInterval(fetchIfPresent, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleApprovalClick = async () => {
        setLoadingApprovalCounts(true);
        try {
            
            const counts = await dashboardService.getApprovalCounts();
            
            setApprovalCounts(counts);
            setIsApprovalModalOpen(true);
            
        } catch (error) {
            console.error('Error loading approval counts:', error);
        } finally {
            setLoadingApprovalCounts(false);
        }
    };

    if (currentUser?.roleId === 3) {
        return (
            <main className={clsx(activityAreaStyle.mainTag, "flex-1 items-center justify-center")}>
                <div className="flex flex-col items-start gap-6 p-8 rounded-lg">
                    <div className="flex items-center gap-2">
                        <PeopleAlt fontSize="large" />
                        <span>Active Users: {stats.ActiveUsers}</span>
                        <HourglassEmpty fontSize="large" className="ml-8" />
                        <span>Total Pending: {stats.TotalPending}</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-300 transition-colors p-2 rounded"
                        onClick={() => {
                            handleApprovalClick();
                        }}>
                        
                        <CheckCircle fontSize="large" />
                        <span>Approved: {stats.Approved}</span>
                    </div>
                </div>
                <ApprovalSummaryModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    dailyCount={approvalCounts.Daily}
                    monthlyCount={approvalCounts.Monthly}
                />
            </main>
        );
    }

    if (currentUser?.roleId === 4) {
        return (
            <main className={clsx(activityAreaStyle.mainTag, "flex-1 items-center justify-center")}>
                <div className="flex flex-col items-start gap-6 p-8 rounded-lg">
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-300 transition-colors p-2 rounded"
                        onClick={() => {
                            handleApprovalClick();
                        }}>
                        <CheckCircle fontSize="large" />
                        <span>Approved: {encoderStats.Approved}</span>
                        <Cancel fontSize="large" className="ml-8" />
                        <span>Rejected: {encoderStats.Rejected}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Edit fontSize="large" />
                        <span>Total Encoded: {encoderStats.Encoded}</span>
                    </div>
                </div>
                <ApprovalSummaryModal
                    isOpen={isApprovalModalOpen}
                    onClose={() => setIsApprovalModalOpen(false)}
                    dailyCount={approvalCounts.Daily}
                    monthlyCount={approvalCounts.Monthly}
                />
            </main>
        );
    }

    if (userRole === undefined) {
        return <div className="">User role not found.</div>;
    }

    const dashboardItems: DashboardItems[] = [
        { label: "Active Users",    valueKey: "ActiveUsers",    icon: PeopleAlt,        roleID: access.approver },
        { label: "Areas",           valueKey: "Areas",          icon: LocationOn,       roleID: access.execs },
        { label: "Branches",        valueKey: "Branches",       icon: Apartment,        roleID: access.execs },
        { label: "Total Pending",   valueKey: "Pending",        icon: HourglassEmpty,   roleID: access.branches },
        { label: "Approved",        valueKey: "Approved",       icon: CheckCircle,      roleID: access.all },
        { label: "Rejected",        valueKey: "Declined",       icon: Cancel,           roleID: access.staff },
        { label: "Total Encoded",   valueKey: "Encoded",        icon: Edit,             roleID: access.staff },
    ];

    return (
        <main className={clsx(activityAreaStyle.mainTag, "flex-1 items-center justify-center")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {dashboardItems
                    .filter(item => Array.isArray(item.roleID) && item.roleID.includes(userRole))
                    .map((item) => {
                        const Icon = item.icon;
                        return (
                            <div 
                            key={item.valueKey} 
                            className={`${item.valueKey === 'Approved' ? 'cursor-pointer hover:bg-gray-300 transition-colors p-2 rounded' : ''}`}
                            onClick={item.valueKey === 'Approved' ? () => {
                                
                                handleApprovalClick();
                            } : undefined}
                        >
                                <Icon fontSize="large" />
                                <span className="">
                                    {item.label}:&nbsp;
                                </span>
                                <span className="">
                                    {loading
                                        ? "..."
                                        : item.valueKey
                                            ? data?.[item.valueKey] ?? 0
                                            : 0}
                                </span>
                            </div>
                        );
                    })}
            </div>
            <ApprovalSummaryModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                dailyCount={approvalCounts.Daily}
                monthlyCount={approvalCounts.Monthly}
            />
        </main>
    );
}