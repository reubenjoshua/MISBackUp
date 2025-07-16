import React, { useState, useEffect } from "react";
import { activityAreaStyle, textStyles } from "@/assets/styles";
import DailyDataSheetModal from "../components/DailyDataSheetModal";
import { DailyForm } from "../models/types/Branch";
import { dailyService } from "../services/dailyService";
import { branchService } from "../services/branchService";
import { sourceTypeService } from "../services/sourceService";
import { sourceNameService } from "../services/sourceService";
import { areaService } from "../services/areaService";
import { useUserStore } from "@/zustand/userStore";

const columns = [
  "Date", "Branch", "Area", "Source Type", "Source Name", "Production Volume", "Operation Hours", "Number of Service Interruptions", "Total Number of Hours of Service Interruption", "Electricity Consumption", "VFD Frequency", "Spot Flow", "Spot Pressure", "Time Spot Measurements were taken", "Line Voltage [L1-L2]", "Line Voltage [L2-L3]", "Line Voltage [L3-L1]", "Line Current [L1-L2]", "Line Current [L2-L3]", "Line Current [L3-L1]", "Status", "Comment"
];

const initialDailyFields: DailyForm = {
  sourceType: 0,
  sourceName: 0,
  productionVolume: false,
  operationHours: false,
  serviceInterruption: false,
  totalHoursServiceInterruption: false,
  electricityConsumption: false,
  VFDFrequency: false,
  spotFlow: false,
  spotPressure: false,
  timeSpotMeasurements: false,
  lineVoltage1: false,
  lineVoltage2: false,
  lineVoltage3: false,
  lineCurrent1: false,
  lineCurrent2: false,
  lineCurrent3: false,
};

export default function Daily() {
  const currentUser = useUserStore((state) => state.user);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [branch, setBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fields, setFields] = useState<DailyForm>(initialDailyFields);
  
  // Real data state
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [sourceTypes, setSourceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [sourceNames, setSourceNames] = useState<any[]>([]);

  // Find the selected branch object and its areaId
  const selectedBranchObj = branches.find(b => b.id === parseInt(branch));
  const areaId = selectedBranchObj ? selectedBranchObj.areaId : null;

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    fetchBranches();
    fetchSourceTypes();
    fetchAreas();
    fetchSourceNames();
  }, []);

  // Auto-select branch for branch admins and encoders
  useEffect(() => {
    if ((currentUser?.roleId === 3 || currentUser?.roleId === 4) && currentUser?.branchId && branches.length > 0) {
      setBranch(currentUser.branchId.toString());
    }
  }, [currentUser?.roleId, currentUser?.branchId, branches]);

  // useEffect(() => {
  //   console.log('Branches loaded in parent:', branches);
  // }, [branches]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dailyService.getAllDaily();
      
      setDailyData(data);
    } catch (err) {
      console.error('Error fetching daily data:', err);
      setError('Failed to fetch daily data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await branchService.getAllBranch();
      
      setBranches(data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchSourceTypes = async () => {
    try {
      const data = await sourceTypeService.getAllSourceType();
      setSourceTypes(data);
    } catch (err) {
      console.error('Error fetching source types:', err);
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await areaService.getAllArea();
      setAreas(data);
    } catch (err) {
      console.error('Error fetching areas:', err);
    }
  };

  const fetchSourceNames = async () => {
    try {
      const data = await sourceNameService.getAllSourceName(undefined, currentUser?.roleId);
      setSourceNames(data);
    } catch (err) {
      console.error('Error fetching source names:', err);
    }
  };

  // Filter data based on selected filters
  const filteredData = dailyData.filter(item => {
    // Date range filter
    if (from && item.date) {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      if (itemDate < from) return false;
    }
    if (to && item.date) {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      if (itemDate > to) return false;
    }

    // Source type filter
    if (sourceType && item.sourceType !== parseInt(sourceType)) {
      return false;
    }

    // Branch filter
    if (branch && item.branchId !== parseInt(branch)) {
      return false;
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const getSourceTypeName = (sourceTypeId: number) => {
    const sourceType = sourceTypes.find(st => st.id === sourceTypeId);
    return sourceType ? sourceType.sourceType : 'Unknown';
  };

  const getBranchName = (branchId: number) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branchName : 'Unknown';
  };

  const getAreaName = (areaId: number) => {
    if (areaId === 1) return "Vista";
    if (areaId === 2) return "JV";
    if (areaId === 3) return "FPR";
    return `Area ${areaId}`;
  };

  const getSourceName = (sourceNameId: number) => {
    const sn = sourceNames.find(s => s.id === sourceNameId);
    return sn ? sn.sourceName : 'N/A';
  };

  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      // Use the correct field keys from the modal
      const dailyData = {
        sourceType: Number(values.sourceType),
        sourceName: Number(values.sourceName),
        productionVolume: values.productionVolume,
        operationHours: values.operationHours,
        serviceInterruption: values.serviceInterruption,
        totalHoursServiceInterruption: values.totalHoursServiceInterruption,
        electricityConsumption: values.electricityConsumption,
        VFDFrequency: values.VFDFrequency,
        spotFlow: values.spotFlow,
        spotPressure: values.spotPressure,
        timeSpotMeasurements: values.timeSpotMeasurements,
        lineVoltage1: values.lineVoltage1,
        lineVoltage2: values.lineVoltage2,
        lineVoltage3: values.lineVoltage3,
        lineCurrent1: values.lineCurrent1,
        lineCurrent2: values.lineCurrent2,
        lineCurrent3: values.lineCurrent3,
        date: values.date,
        branchId: values.branchId,
        areaId: values.areaId,
        statusId: 1,
        comment: ''
      };
      
      await dailyService.createDaily(dailyData);
      await fetchData();
      setShowModal(false);
    } catch (err) {
      console.error('Error creating daily record:', err);
      setError('Failed to create daily record');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <main className={activityAreaStyle.mainTag}>
      <div className="header-section mb-4">
        <h1 className="text-3xl font-semibold text-center">Daily collection sheet</h1>
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
              <option value="">All Source Types</option>
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
              <option value="">All Branches</option>
              {branches
                .filter(branch => 
                  // For branch admins and encoders, only show their assigned branch
                  // For central admins and super admins, show all branches
                  (currentUser?.roleId === 3 || currentUser?.roleId === 4) ? branch.id === currentUser.branchId : true
                )
                .map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
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
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading daily data...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4 text-red-600">
          {error}
        </div>
      )}
      
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={textStyles.tableNoResult}>
                  {loading ? 'Loading...' : 'No data found'}
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td className={textStyles.tableDisplayData}>{formatDate(row.date)}</td>
                  <td className={textStyles.tableDisplayData}>{getBranchName(row.branchId)}</td>
                  <td className={textStyles.tableDisplayData}>{row.areaName || 'Area undefined'}</td>
                  <td className={textStyles.tableDisplayData}>{getSourceTypeName(row.sourceType)}</td>
                  <td className={textStyles.tableDisplayData}>{row.sourceNameName || getSourceName(row.sourceName) || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.productionVolume || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.operationHours || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.serviceInterruption || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.totalHoursServiceInterruption || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.electricityConsumption || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.VFDFrequency || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.spotFlow || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.spotPressure || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.timeSpotMeasurements || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.lineVoltage1 || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.lineVoltage2 || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.lineVoltage3 || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.lineCurrent1 || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.lineCurrent2 || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>{row.lineCurrent3 || 'N/A'}</td>
                  <td className={textStyles.tableDisplayData}>
                    <span className={`px-2 py-1 rounded text-xs ${
                      row.statusName === 'Approved' ? 'bg-green-100 text-green-800' :
                      row.statusName === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      row.statusName === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {row.statusName || 'Pending'}
                    </span>
                  </td>
                  <td className={textStyles.tableDisplayData}>{row.comment || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <DailyDataSheetModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        branchId={branch ? parseInt(branch) : null}
        areaId={areaId}
        branches={branches}
      />
    </main>
  );
}