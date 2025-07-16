import React, { useState, useEffect } from "react";
import { activityAreaStyle, textStyles } from "@/assets/styles";
import MonthlyDataSheetModal from "../components/MonthlyDataSheetModal";
import { monthlyService } from "@/services/monthlyService";
import { sourceTypeService } from "@/services/sourceService";
import { branchService } from "@/services/branchService";
import { useUserStore } from "@/zustand/userStore";
import api from "@/services/getAPI";

const columns = [
  "Month", "Year", "Source Type", "Production Volume", "Operation Hours", "Number of Service Interruptions", "Total Number of Hours of Service Interruption", "Electricity Consumption", "Electricity Cost", "Bulk Cost", "Bulk Outtake", "Name of Bulk Provider", "WTP Raw Water Cost", "WTP Raw Water Volume", "Method of Disinfection", "Disinfectant Cost", "Disinfection Amount", "Brand and Type of Disinfectant", "Other Treatment Cost", "Liters Consumed Emergency Operations", "Fuel Cost Emergency Operations", "Total Hours Used Emergency Operations", "Liters Consumed Genset Operated", "Fuel Cost Genset Operated"
];

export default function Monthly() {
  const currentUser = useUserStore((state) => state.user);
  const [year, setYear] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [branch, setBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceTypes, setSourceTypes] = useState<{ id: number; sourceType: string }[]>([]);
  const [branches, setBranches] = useState<{ id: number; branchName: string }[]>([]);


  const columnKeyMap = {
  "Month": "month",
  "Year": "year",
  "Source Type": "sourceType",
  "Production Volume": "productionVolume",
  "Operation Hours": "operationHours",
  "Number of Service Interruptions": "serviceInterruption",
  "Total Number of Hours of Service Interruption": "totalHoursServiceInterruption",
  "Electricity Consumption": "electricityConsumption",
  "Electricity Cost": "electricityCost",
  "Bulk Cost": "bulkCost",
  "Bulk Outtake": "bulkOuttake",
  "Name of Bulk Provider": "bulkProvider",
  "WTP Raw Water Cost": "WTPCost",
  "WTP Raw Water Volume": "WTPVolume",
  "Method of Disinfection": "disinfectionMode",
  "Disinfectant Cost": "disinfectantCost",
  "Disinfection Amount": "disinfectionAmount",
  "Brand and Type of Disinfectant": "disinfectionBrandType",
  "Other Treatment Cost": "otherTreatmentCost",
  "Liters Consumed Emergency Operations": "emergencyLitersConsumed",
  "Fuel Cost Emergency Operations": "emergencyFuelCost",
  "Total Hours Used Emergency Operations": "emergencyTotalHoursUsed",
  "Liters Consumed Genset Operated": "gensetLitersConsumed",
  "Fuel Cost Genset Operated": "gensetFuelCost"
} as const;

const sourceTypeMap = {
  1: "Deep Well - Electric",
  2: "Deep Well - Genset Operated",
  3: "Shallow Well",
  4: "Spring - Gravity",
  5: "Spring - Power-driven",
  6: "Bulk",
  7: "WTP",
  8: "Booster"
};

  useEffect(() => {
    // Fetch source types using service
    sourceTypeService.getAllSourceType()
      .then(data => setSourceTypes(data))
      .catch(() => setSourceTypes([]));

    // Fetch branches using service
    branchService.getAllBranch()
      .then(data => setBranches(data))
      .catch(() => setBranches([]));
  }, []);

  // Auto-select branch for branch admins and encoders
  useEffect(() => {
    if ((currentUser?.roleId === 3 || currentUser?.roleId === 4) && currentUser?.branchId && branches.length > 0) {
      setBranch(currentUser.branchId.toString());
    }
  }, [currentUser?.roleId, currentUser?.branchId, branches]);

  useEffect(() => {
  fetchMonthlyData();
}, [year, sourceType, branch]);

  // Add this function to convert month number to month name
  const getMonthName = (monthNumber: number) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1] || monthNumber;
  };

  const fetchMonthlyData = () => {
    setLoading(true);
    setError(null);
    
    // Build query parameters for filtering
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (sourceType) params.append('sourceTypeId', sourceType);
    if (branch) params.append('branchId', branch);
    
    // Use the API service with the correct base URL
    const url = `/monthly-data${params.toString() ? '?' + params.toString() : ''}`;
    
    api.get(url)
      .then((response: any) => setMonthlyData(response.data))
      .catch((err: any) => setError("Failed to fetch monthly data"))
      .finally(() => setLoading(false));
  };

  return (
    <main className={activityAreaStyle.mainTag}>
      <div className="header-section mb-4">
        <h1 className="text-3xl font-semibold text-center">Monthly Collection Sheet</h1>
      </div>
      <div className="filter-section space-y-4 mb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="year" className="text-sm">Year</label>
            <input
              id="year"
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder="Year"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center ml-auto">
            <select
              className="border rounded px-2 py-1"
              value={sourceType}
              onChange={e => setSourceType(e.target.value)}
            >
              <option value="">Source Type</option>
              {sourceTypes.map(st => (
    <option key={st.id} value={st.id}>{st.sourceType}</option>
  ))}
            </select>
            <select
              className="border rounded px-2 py-1"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              disabled={currentUser?.roleId === 3 || currentUser?.roleId === 4}
            >
              <option value="">Branch</option>
              {branches
                .filter(b => (currentUser?.roleId === 3 || currentUser?.roleId === 4) ? b.id === currentUser.branchId : true)
                .map(b => (
    <option key={b.id} value={b.id}>{b.branchName}</option>
  ))}
            </select>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              onClick={() => setShowModal(true)}
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div className={activityAreaStyle.divTableTag}>
        <table className={activityAreaStyle.tableTag}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col} className={textStyles.tableHeader}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {monthlyData.length === 0 ? (
    <tr>
      <td colSpan={columns.length} className={textStyles.tableNoResult}>
        No data found
      </td>
    </tr>
  ) : (
    monthlyData.map((row, idx) => (
      <tr key={idx}>
        {columns.map(col => {
          const key = columnKeyMap[col as keyof typeof columnKeyMap];
          const value = row[key];
          
          // Check if this is the Source Type column
          if (col === "Source Type") {
            return (
              <td key={col} className={textStyles.tableDisplayData}>
                {sourceTypeMap[value] ?? value ?? ""}
              </td>
            );
          }
          // Check if this is the Month column
          if (col === "Month") {
            return (
              <td key={col} className={textStyles.tableDisplayData}>
                {getMonthName(Number(value))}
              </td>
            );
          }
          return (
            <td key={col} className={textStyles.tableDisplayData}>
              {value ?? ""}
            </td>
          );
        })}
      </tr>
    ))
  )}
</tbody>
        </table>
      </div>
      <MonthlyDataSheetModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          fetchMonthlyData();
        }}
        onSubmit={() => {
          setShowModal(false);
          fetchMonthlyData();
        }}
      />
    </main>
  );
}