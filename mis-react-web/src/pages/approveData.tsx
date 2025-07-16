import React, { useState, useEffect } from "react";
import { activityAreaStyle, textStyles } from "@/assets/styles";
import { approvalService } from "@/services/approvalService";
import { Status, ApprovalData, MonthlyApprovalData } from "@/models/types/Status";
import ApprovalDetailModal from "@/components/ApprovalDetailModal";
import MonthlyApprovalDetailModal from "@/components/MonthlyApprovalDetailModal";
import { sourceTypeService, sourceNameService } from "@/services/sourceService";
import { useUserStore } from "@/zustand/userStore";
import { usePageState } from "@/hooks/usePageState";

const dailyColumns = [
  "Date", "Area", "Branch", "Status", "Remarks", "Action"
];

const monthlyColumns = [
  "Month/Year", "Area", "Branch", "Status", "Remarks", "Action"
];

type TabType = 'daily' | 'monthly';

export default function ApproveData() {
  // Page state management
  const { saveProperty, getProperty } = usePageState();

  // Initialize state with saved values or defaults
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = getProperty('activeTab');
    console.log('ApproveData - Saved activeTab:', savedTab);
    return (savedTab as TabType) || 'daily';
  });
  
  const [from, setFrom] = useState(getProperty('from', ""));
  const [to, setTo] = useState(getProperty('to', ""));
  const [sourceType, setSourceType] = useState(getProperty('sourceType', ""));
  const [branch, setBranch] = useState(getProperty('branch', ""));
  const [selectedStatus, setSelectedStatus] = useState(getProperty('selectedStatus', "All"));
  
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [approvalData, setApprovalData] = useState<ApprovalData[]>([]);
  const [monthlyApprovalData, setMonthlyApprovalData] = useState<MonthlyApprovalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedData, setSelectedData] = useState<ApprovalData | null>(null);
  const [selectedMonthlyData, setSelectedMonthlyData] = useState<MonthlyApprovalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [sourceTypes, setSourceTypes] = useState<{ id: number; sourceType: string }[]>([]);
  const [sourceNames, setSourceNames] = useState<{ id: number; sourceName: string }[]>([]);
  const currentUser = useUserStore((state) => state.user);

  // Save state when values change
  useEffect(() => {
    console.log('ApproveData - Saving activeTab:', activeTab);
    saveProperty('activeTab', activeTab);
  }, [activeTab, saveProperty]);

  useEffect(() => {
    saveProperty('from', from);
  }, [from, saveProperty]);

  useEffect(() => {
    saveProperty('to', to);
  }, [to, saveProperty]);

  useEffect(() => {
    saveProperty('sourceType', sourceType);
  }, [sourceType, saveProperty]);

  useEffect(() => {
    saveProperty('branch', branch);
  }, [branch, saveProperty]);

  useEffect(() => {
    saveProperty('selectedStatus', selectedStatus);
  }, [selectedStatus, saveProperty]);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      const response = await approvalService.getApprovalData();
      setApprovalData(response);
    } catch (error) {
      console.error('Failed to fetch daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const response = await approvalService.getMonthlyApprovalData();
      setMonthlyApprovalData(response);
    } catch (error) {
      console.error('Failed to fetch monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (recordId: number, statusId: number, remarks: string) => {
    try {
      await approvalService.updateApprovalStatus(recordId, statusId, remarks);
      fetchDailyData(); // Refresh data after update
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleMonthlyStatusUpdate = async (recordId: number, statusId: number, remarks: string) => {
    try {
      await approvalService.updateMonthlyApprovalStatus(recordId, statusId, remarks);
      fetchMonthlyData(); // Refresh data after update
    } catch (error) {
      console.error('Failed to update monthly status:', error);
    }
  };

  const handleApprove = async (recordId: number) => {
    const acceptedStatus = statuses.find(s => s.statusName === 'Accepted');
    if (acceptedStatus) {
      await handleStatusUpdate(recordId, acceptedStatus.id, 'Approved');
    }
  };

  const handleMonthlyApprove = async (recordId: number) => {
    const acceptedStatus = statuses.find(s => s.statusName === 'Accepted');
    if (acceptedStatus) {
      await handleMonthlyStatusUpdate(recordId, acceptedStatus.id, 'Approved');
    }
  };

  const handleReject = async (recordId: number, remarks: string) => {
    const rejectedStatus = statuses.find(s => s.statusName === 'Rejected');
    if (rejectedStatus) {
      await handleStatusUpdate(recordId, rejectedStatus.id, remarks);
    }
  };

  const handleMonthlyReject = async (recordId: number, remarks: string) => {
    const rejectedStatus = statuses.find(s => s.statusName === 'Rejected');
    if (rejectedStatus) {
      await handleMonthlyStatusUpdate(recordId, rejectedStatus.id, remarks);
    }
  };

  const handleView = (data: ApprovalData) => {
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const handleMonthlyView = (data: MonthlyApprovalData) => {
    setSelectedMonthlyData(data);
    setIsMonthlyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
  };

  const handleCloseMonthlyModal = () => {
    setIsMonthlyModalOpen(false);
    setSelectedMonthlyData(null);
  };

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await approvalService.getAllStatuses();
        setStatuses(data);
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyData();
    } else {
      fetchMonthlyData();
    }
  }, [activeTab]);

  useEffect(() => {
    sourceTypeService.getAllSourceType().then(setSourceTypes);
    sourceNameService.getAllSourceName(undefined, currentUser?.roleId).then(setSourceNames);
  }, [currentUser?.roleId]);

  // Filter daily data based on selected filters
  const filteredDailyData = approvalData.filter(item => {
    const dateMatch = !from || !to || (item.date >= from && item.date <= to);
    const sourceMatch = !sourceType || item.sourceType.toString() === sourceType;
    const branchMatch = !branch || item.branchName === branch;
    const statusMatch = selectedStatus === "All" || item.statusName === selectedStatus;
    return dateMatch && sourceMatch && branchMatch && statusMatch;
  });

  // Filter monthly data based on selected filters
  let filteredMonthlyData = monthlyApprovalData;
  // Filter for Branch Admins and Encoders
  const isBranchAdmin = currentUser?.roleName === 'Branch Admin'; // roleId 3
  const isEncoder = currentUser?.roleName === 'Encoder'; // roleId 4
  const branchId = currentUser?.branchId;
  if ((isBranchAdmin || isEncoder) && branchId) {
    filteredMonthlyData = filteredMonthlyData.filter(item => item.branchId === branchId);
  }
  filteredMonthlyData = filteredMonthlyData.filter(item => {
    const dateMatch = !from || !to || (item.month && item.year && `${item.year}-${item.month}` >= from && `${item.year}-${item.month}` <= to);
    const sourceMatch = !sourceType || item.sourceType.toString() === sourceType;
    const branchMatch = !branch || item.branchName === branch;
    const statusMatch = selectedStatus === "All" || item.statusName === selectedStatus;
    return dateMatch && sourceMatch && branchMatch && statusMatch;
  });

  // Add this function to convert month number to month name
  const getMonthName = (monthNumber: number) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1] || monthNumber;
  };

  // Auto-select branch for branch admins and encoders
  useEffect(() => {
    if ((currentUser?.roleId === 3 || currentUser?.roleId === 4) && currentUser?.branchName) {
      setBranch(currentUser.branchName);
    }
  }, [currentUser?.roleId, currentUser?.branchName, activeTab, approvalData, monthlyApprovalData]);

  return (
    <main className={activityAreaStyle.mainTag}>
      <div className="header-section mb-4">
        <h1 className="text-3xl font-semibold text-center">Status for Approval</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg ${
            activeTab === 'daily'
              ? 'bg-blue-600 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg ${
            activeTab === 'monthly'
              ? 'bg-blue-600 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
      </div>

      <div className="filter-section space-y-4 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="from" className="text-sm">From</label>
            <input
              id="from"
              type="date"
              className="border rounded px-2 py-1 w-32"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
            <span className="mx-2">-</span>
            <label htmlFor="to" className="text-sm">To</label>
            <input
              id="to"
              type="date"
              className="border rounded px-2 py-1 w-32"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center ml-auto">
            <select
              className="border rounded px-2 py-1"
              value={sourceType}
              onChange={e => setSourceType(e.target.value)}
            >
              <option value="">Source Type</option>
              {sourceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.sourceType}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              disabled={currentUser?.roleId === 3 || currentUser?.roleId === 4}
            >
              <option value="">Branch</option>
              {Array.from(new Set(
                activeTab === 'daily' 
                  ? approvalData.map(item => item.branchName)
                  : monthlyApprovalData.map(item => item.branchName)
              ))
                .filter(branchName =>
                  (currentUser?.roleId === 3 || currentUser?.roleId === 4) ? branchName === currentUser.branchName : true
                )
                .map(branchName => (
                  <option key={branchName} value={branchName}>{branchName}</option>
                ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="All">Status</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full h-full overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              {(activeTab === 'daily' ? dailyColumns : monthlyColumns).map(col => (
                <th key={col} className={textStyles.tableHeader}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={(activeTab === 'daily' ? dailyColumns : monthlyColumns).length} className={textStyles.tableNoResult}>
                  Loading...
                </td>
              </tr>
            ) : (activeTab === 'daily' ? filteredDailyData : filteredMonthlyData).length === 0 ? (
              <tr>
                <td colSpan={(activeTab === 'daily' ? dailyColumns : monthlyColumns).length} className={textStyles.tableNoResult}>
                  No data found
                </td>
              </tr>
            ) : activeTab === 'daily' ? (
              filteredDailyData.map((row) => (
                <tr key={row.id}>
                  <td className={textStyles.tableDisplayData}>{row.date}</td>
                  <td className={textStyles.tableDisplayData}>{row.areaName}</td>
                  <td className={textStyles.tableDisplayData}>{row.branchName}</td>
                  <td className={textStyles.tableDisplayData}>{row.statusName}</td>
                  <td className={textStyles.tableDisplayData}>
                    {row.comment && row.comment.length > 35 
                      ? row.comment.slice(0, 35) + "..." 
                      : row.comment}
                  </td>
                  <td className={textStyles.tableDisplayData}>
                    <button
                      onClick={() => handleView(row)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              filteredMonthlyData.map((row) => (
                <tr key={row.id}>
                  <td className={textStyles.tableDisplayData}>{getMonthName(Number(row.month))} {row.year}</td>
                  <td className={textStyles.tableDisplayData}>{row.areaName}</td>
                  <td className={textStyles.tableDisplayData}>{row.branchName}</td>
                  <td className={textStyles.tableDisplayData}>{row.statusName}</td>
                  <td className={textStyles.tableDisplayData}>
                    {row.comment && row.comment.length > 35 
                      ? row.comment.slice(0, 35) + "..." 
                      : row.comment}
                  </td>
                  <td className={textStyles.tableDisplayData}>
                    <button
                      onClick={() => handleMonthlyView(row)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Daily Approval Detail Modal */}
      <ApprovalDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={selectedData}
        onApprove={handleApprove}
        onReject={handleReject}
        statuses={statuses}
        sourceTypes={sourceTypes}
        sourceNames={sourceNames}
      />

      {/* Monthly Approval Detail Modal */}
      <MonthlyApprovalDetailModal
        isOpen={isMonthlyModalOpen}
        onClose={handleCloseMonthlyModal}
        data={selectedMonthlyData}
        onApprove={handleMonthlyApprove}
        onReject={handleMonthlyReject}
        statuses={statuses}
      />
    </main>
  );
}