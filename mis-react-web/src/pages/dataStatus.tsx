import React, { useEffect, useState } from "react";
import { activityAreaStyle, textStyles } from "@/assets/styles";
import { dailyService } from "@/services/dailyService";
import { monthlyService } from "@/services/monthlyService";
import { requiredFieldsService } from "@/services/requiredFieldsService";
import { useUserStore } from "@/zustand/userStore";
import { sourceTypeService, sourceNameService } from "@/services/sourceService";

// Define the type for a daily row
type DailyRow = {
  id?: number | string;
  date?: string;
  statusName?: string;
  status?: string;
  comment?: string;
  remarks?: string;
  branchId?: number;
  areaId?: number;
  areaName?: string;
  branchName?: string;
  sourceType?: number;
  sourceName?: number;
  productionVolume?: number;
  operationHours?: number;
  serviceInterruption?: number;
  totalHoursServiceInterruption?: number;
  electricityConsumption?: number;
  VFDFrequency?: number;
  spotFlow?: number;
  spotPressure?: number;
  timeSpotMeasurements?: number;
  lineVoltage1?: number;
  lineVoltage2?: number;
  lineVoltage3?: number;
  lineCurrent1?: number;
  lineCurrent2?: number;
  lineCurrent3?: number;
  // Add any other fields you use from the API
};

// Define the type for a monthly row
type MonthlyRow = {
  id?: number | string;
  month?: string;
  year?: string;
  statusName?: string;
  status?: string;
  comment?: string;
  remarks?: string;
  branchId?: number;
  areaId?: number;
  areaName?: string;
  branchName?: string;
  sourceType?: number;
  sourceName?: number;
  sourceTypeName?: string;
  sourceNameName?: string;
  productionVolume?: number;
  operationHours?: number;
  serviceInterruption?: number;
  totalHoursServiceInterruption?: number;
  electricityConsumption?: number;
  electricityCost?: number;
  bulkCost?: number;
  bulkOuttake?: number;
  bulkProvider?: string;
  WTPCost?: number;
  WTPSource?: string;
  WTPVolume?: number;
  disinfectionMode?: string;
  disinfectantCost?: number;
  disinfectionAmount?: number;
  disinfectionBrandType?: string;
  otherTreatmentCost?: number;
  emergencyLitersConsumed?: number;
  emergencyFuelCost?: number;
  emergencyTotalHoursUsed?: number;
  gensetLitersConsumed?: number;
  gensetFuelCost?: number;
  productionVolumeAutoSum?: number;
  operationHoursAutoSum?: number;
  serviceInterruptionAutoSum?: number;
  totalHoursServiceInterruptionAutoSum?: number;
  // Add any other fields you use from the API
};

// Helper to convert month number to month name
function getMonthName(monthNumber?: string | number): string {
  if (!monthNumber) return "";
  const month = typeof monthNumber === "string" ? parseInt(monthNumber, 10) : monthNumber;
  const monthNames = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month] || "";
}

export default function DataStatus() {
  const currentUser = useUserStore((state) => state.user);
  const [dailyRows, setDailyRows] = useState<DailyRow[]>([]);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // State for custom Approval Details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRow, setDetailRow] = useState<DailyRow | MonthlyRow | null>(null);
  const [detailType, setDetailType] = useState<'daily' | 'monthly'>('daily');
  const [sourceTypes, setSourceTypes] = useState<any[]>([]);
  const [sourceNames, setSourceNames] = useState<any[]>([]);

  // New state for editable required fields
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [editValues, setEditValues] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    setLoading(true);
    
    // Fetch both daily and monthly data
    Promise.all([
      dailyService.getAllDaily(),
      monthlyService.getAllMonthly()
    ])
      .then(([dailyData, monthlyData]) => {
        // Filter daily data for encoder's branch
        setDailyRows(
          dailyData.filter((row: DailyRow) => row.branchId === currentUser?.branchId)
        );
        
        // Filter monthly data for encoder's branch
        setMonthlyRows(
          monthlyData.filter((row: MonthlyRow) => row.branchId === currentUser?.branchId)
        );
        
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [currentUser]);

  // Dummy helpers for source type/name (replace with real lookups if available)
  const getSourceTypeName = (id: number | undefined) => {
  const st = sourceTypes.find((t) => t.id === id);
  return st ? st.sourceType : id || "";
};
  const getSourceName = (id: number | undefined) => {
  const sn = sourceNames.find((n) => n.id === id);
  return sn ? sn.sourceName : id || "";
};

  const currentRows = activeTab === 'daily' ? dailyRows : monthlyRows;
  const currentType = activeTab;

  // Helper to check if a field is editable (required field for rejected form)
  const isEditable = (field: string) => {
    return (detailRow?.statusName === "Rejected" || detailRow?.statusName === "Pending") && requiredFields.includes(field);
  };

  // Helper to render field as input or read-only
  const renderField = (label: string, field: string, value: any, type: string = 'text') => {
    if (isEditable(field)) {
      return (
        <div>
          <label className="font-medium text-gray-700">{label}:</label>
          <input
            type={type}
            value={editValues[field] || value || ""}
            onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    } else {
      return (
        <div>
          <label className="font-medium text-gray-700">{label}:</label>
          <p className="text-gray-900">{value || ""}</p>
        </div>
      );
    }
  };

  // Fetch required fields when opening modal for rejected form
  useEffect(() => {
     if (showDetailModal && detailRow && (detailRow.statusName === "Rejected" || detailRow.statusName === "Pending") && currentUser?.branchId) {
      requiredFieldsService.getRequiredFields(currentUser.branchId)
        .then(data => {
          // The backend returns { daily: [...], monthly: [...] }
          const formTypeFields = detailType === 'daily' ? data.daily : data.monthly;
          setRequiredFields(formTypeFields || []);
          setEditValues(detailRow); // Initialize with current values
        })
        .catch(err => {
          console.error("Failed to fetch required fields:", err);
          setRequiredFields([]);
        });
    } else {
      setRequiredFields([]);
      setEditValues({});
    }
  }, [showDetailModal, detailRow, detailType, currentUser?.branchId]);

  useEffect(() => {
    // Fetch all source types
    sourceTypeService.getAllSourceType().then(setSourceTypes);

    // Fetch all source names (no filter)
    sourceNameService.getAllSourceName().then(setSourceNames);
}, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!detailRow || !currentUser?.branchId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Only send required fields that have been modified
      const payload: any = {};
      requiredFields.forEach(field => {
        if (editValues[field] !== undefined && editValues[field] !== detailRow[field as keyof typeof detailRow]) {
          payload[field] = editValues[field];
        }
      });

      // Add form type and ID
      payload.formType = detailType;
      payload.id = detailRow.id;

      // Call appropriate update service
      if (detailType === 'daily') {
        await dailyService.updateDaily(Number(detailRow.id), payload);
      } else {
        await monthlyService.updateMonthly(Number(detailRow.id), payload);
      }

      // Refresh data
      const [dailyData, monthlyData] = await Promise.all([
        dailyService.getAllDaily(),
        monthlyService.getAllMonthly()
      ]);

      setDailyRows(dailyData.filter((row: DailyRow) => row.branchId === currentUser?.branchId));
      setMonthlyRows(monthlyData.filter((row: MonthlyRow) => row.branchId === currentUser?.branchId));

      // Close modal
      setShowDetailModal(false);
      setDetailRow(null);
      setEditValues({});
      setRequiredFields([]);
    } catch (err) {
      setSubmitError("Failed to update form. Please try again.");
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter your data before rendering (example: filteredRows)
  const filteredRows = currentRows.filter(row => {
    const statusMatch = selectedStatus === "All" || row.statusName === selectedStatus;
    return statusMatch;
  });

  return (
    <main className={activityAreaStyle.mainTag}>
      <div className="header-section mb-4">
        <h1 className="text-3xl font-semibold text-center">Status for Approval</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex border rounded-lg overflow-hidden">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Forms
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('monthly')}
          >
            Monthly Forms
          </button>
        </div>
      </div>

      <div className="filter-section space-y-4 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

      <div className={activityAreaStyle.divTableTag}>
        <table className={activityAreaStyle.tableTag}>
          <thead>
            <tr>
              <th className={textStyles.tableHeader}>
                {activeTab === 'daily' ? 'Date' : 'Month/Year'}
              </th>
              <th className={textStyles.tableHeader}>Status</th>
              <th className={textStyles.tableHeader}>Remarks</th>
              <th className={textStyles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className={textStyles.tableDisplayData}>Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className={textStyles.tableDisplayData}>{error}</td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={4} className={textStyles.tableDisplayData}>No data found</td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr key={row.id ?? idx}>
                  <td className={textStyles.tableDisplayData}>
                    {activeTab === 'daily' 
                      ? (row as DailyRow).date ?? ""
                      : `${getMonthName((row as MonthlyRow).month)} ${(row as MonthlyRow).year}`
                    }
                  </td>
                  <td className={textStyles.tableDisplayData}>{row.statusName ?? row.status ?? ""}</td>
                  <td className={textStyles.tableDisplayData}>{row.comment ?? row.remarks ?? ""}</td>
                  <td className={textStyles.tableDisplayData}>
                    {(row.statusName ?? "") === "Approved" ? (
                      <button
                        style={{
                          background: "#059669",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "4px 20px",
                          fontWeight: 500,
                        }}
                        onClick={() => {
                          setDetailRow(row);
                          setDetailType(currentType);
                          setShowDetailModal(true);
                        }}
                      >
                        View
                      </button>
                    ) : (
                      <>
                        <button
                          style={{
                            background: "#333",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "4px 12px",
                            marginRight: 16,
                            fontWeight: 500,
                          }}
                          onClick={() => {
                            setDetailRow(row);
                            setDetailType(currentType);
                            setShowDetailModal(true);
                          }}
                        >
                          {currentUser?.roleId === 4 && ((row.statusName ?? row.status) === "Rejected" || (row.statusName ?? row.status) === "Pending")
  ? "Edit Required"
  : "Edit"}
                        </button>
                        <button
                          style={{
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "4px 12px",
                            fontWeight: 500,
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Custom Approval Details Modal for Encoder */}
      {showDetailModal && detailRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {detailType === 'daily' ? 'Approval Details - Daily Form' : 'Monthly Approval Details'}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailRow(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {detailType === 'daily' ? (
              // Daily Form Modal (existing design)
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                    <div>
                      <label className="font-medium text-gray-700">Date:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).date}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Area:</label>
                      <p className="text-gray-900">{detailRow.areaName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Branch:</label>
                      <p className="text-gray-900">{detailRow.branchName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Status:</label>
                      <p className="text-gray-900">{detailRow.statusName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Source Type:</label>
                      <p className="text-gray-900">{getSourceTypeName(detailRow.sourceType)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Source Name:</label>
                      <p className="text-gray-900">{getSourceName(detailRow.sourceName)}</p>
                    </div>
                  </div>

                  {/* Production Data */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Production Data</h3>
                    {renderField("Production Volume", "productionVolume", detailRow.productionVolume, "number")}
                    {renderField("Operation Hours", "operationHours", detailRow.operationHours, "number")}
                    {renderField("Service Interruption", "serviceInterruption", detailRow.serviceInterruption, "number")}
                    {renderField("Total Hours Service Interruption", "totalHoursServiceInterruption", detailRow.totalHoursServiceInterruption, "number")}
                    {renderField("Electricity Consumption", "electricityConsumption", detailRow.electricityConsumption, "number")}
                  </div>
                </div>

                {/* Daily-specific Electrical Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Electrical Measurements</h3>
                    <div>
                      <label className="font-medium text-gray-700">VFD Frequency:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).VFDFrequency}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Spot Flow:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).spotFlow}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Spot Pressure:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).spotPressure}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Time Spot Measurements:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).timeSpotMeasurements}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Line Measurements</h3>
                    <div>
                      <label className="font-medium text-gray-700">Line Voltage 1:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).lineVoltage1}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Line Voltage 2:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).lineVoltage2}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Line Voltage 3:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).lineVoltage3}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Line Current 1:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).lineCurrent1}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Line Current 2:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).lineCurrent2}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Line Current 3:</label>
                      <p className="text-gray-900">{(detailRow as DailyRow).lineCurrent3}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Monthly Form Modal (using MonthlyApprovalDetailModal design)
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                    <div>
                      <label className="font-medium text-gray-700">Month/Year:</label>
                      <p className="text-gray-900">{getMonthName((detailRow as MonthlyRow).month)} {(detailRow as MonthlyRow).year}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Area:</label>
                      <p className="text-gray-900">{detailRow.areaName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Branch:</label>
                      <p className="text-gray-900">{detailRow.branchName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Status:</label>
                      <p className="text-gray-900">{detailRow.statusName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Source Type:</label>
                      <p className="text-gray-900">{(detailRow as MonthlyRow).sourceTypeName || getSourceTypeName(detailRow.sourceType)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Source Name:</label>
                      <p className="text-gray-900">{(detailRow as MonthlyRow).sourceNameName || getSourceName(detailRow.sourceName)}</p>
                    </div>
                  </div>

                  {/* Production Data */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Production Data</h3>
                    {renderField("Production Volume", "productionVolumeAutoSum", (detailRow as MonthlyRow).productionVolumeAutoSum ?? 0, "number")}
                    {renderField("Operation Hours", "operationHoursAutoSum", (detailRow as MonthlyRow).operationHoursAutoSum ?? 0, "number")}
                    {renderField("Service Interruption", "serviceInterruptionAutoSum", (detailRow as MonthlyRow).serviceInterruptionAutoSum ?? 0, "number")}
                    {renderField("Total Hours Service Interruption", "totalHoursServiceInterruptionAutoSum", (detailRow as MonthlyRow).totalHoursServiceInterruptionAutoSum ?? 0, "number")}
                    {renderField("Electricity Consumption", "electricityConsumption", detailRow.electricityConsumption ?? 0, "number")}
                  </div>
                </div>

                {/* Auto Sum Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Auto-Sum Data (From Daily)</h3>
                    <div>
                      <label className="font-medium text-gray-700">Production Volume Auto-Sum:</label>
                      <p className="text-gray-900">{(detailRow as MonthlyRow).productionVolumeAutoSum}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Operation Hours Auto-Sum:</label>
                      <p className="text-gray-900">{(detailRow as MonthlyRow).operationHoursAutoSum}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Service Interruption Auto-Sum:</label>
                      <p className="text-gray-900">{(detailRow as MonthlyRow).serviceInterruptionAutoSum}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Total Hours Service Interruption Auto-Sum:</label>
                      <p className="text-gray-900">{(detailRow as MonthlyRow).totalHoursServiceInterruptionAutoSum}</p>
                    </div>
                  </div>

                  {/* Cost Data */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Cost Information</h3>
                    {renderField("Electricity Cost", "electricityCost", (detailRow as MonthlyRow).electricityCost, "number")}
                    {renderField("Bulk Cost", "bulkCost", (detailRow as MonthlyRow).bulkCost, "number")}
                    {renderField("Bulk Outtake", "bulkOuttake", (detailRow as MonthlyRow).bulkOuttake, "number")}
                    {renderField("Bulk Provider", "bulkProvider", (detailRow as MonthlyRow).bulkProvider, "text")}
                  </div>
                </div>

                {/* WTP and Treatment Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">WTP Information</h3>
                    {renderField("WTP Cost", "WTPCost", (detailRow as MonthlyRow).WTPCost, "number")}
                    {renderField("WTP Source", "WTPSource", (detailRow as MonthlyRow).WTPSource, "text")}
                    {renderField("WTP Volume", "WTPVolume", (detailRow as MonthlyRow).WTPVolume, "number")}
                    {renderField("Disinfection Mode", "disinfectionMode", (detailRow as MonthlyRow).disinfectionMode, "text")}
                    {renderField("Disinfectant Cost", "disinfectantCost", (detailRow as MonthlyRow).disinfectantCost, "number")}
                    {renderField("Disinfection Amount", "disinfectionAmount", (detailRow as MonthlyRow).disinfectionAmount, "number")}
                    {renderField("Disinfection Brand Type", "disinfectionBrandType", (detailRow as MonthlyRow).disinfectionBrandType, "text")}
                    {renderField("Other Treatment Cost", "otherTreatmentCost", (detailRow as MonthlyRow).otherTreatmentCost, "number")}
                  </div>

                  {/* Emergency and Genset Data */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold border-b pb-2">Emergency & Genset</h3>
                    {renderField("Emergency Liters Consumed", "emergencyLitersConsumed", (detailRow as MonthlyRow).emergencyLitersConsumed, "number")}
                    {renderField("Emergency Fuel Cost", "emergencyFuelCost", (detailRow as MonthlyRow).emergencyFuelCost, "number")}
                    {renderField("Emergency Total Hours Used", "emergencyTotalHoursUsed", (detailRow as MonthlyRow).emergencyTotalHoursUsed, "number")}
                    {renderField("Genset Liters Consumed", "gensetLitersConsumed", (detailRow as MonthlyRow).gensetLitersConsumed, "number")}
                    {renderField("Genset Fuel Cost", "gensetFuelCost", (detailRow as MonthlyRow).gensetFuelCost, "number")}
                  </div>
                </div>
              </>
            )}

            {/* Comments */}
            {detailRow.comment && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">Comments</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{detailRow.comment}</p>
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}

            {/* Action Buttons: Submit and Cancel */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailRow(null);
                  setEditValues({});
                  setRequiredFields([]);
                  setSubmitError(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
    );
}