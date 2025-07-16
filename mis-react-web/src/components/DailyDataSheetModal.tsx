import React, { useState, useEffect } from 'react';
import { requiredFieldsService } from '@/services/requiredFieldsService';
import { sourceTypeService, sourceNameService } from '@/services/sourceService';
import { useUserStore } from '@/zustand/userStore';

interface DailyDataSheetModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  branchId?: number | null;
  areaId?: number | null;
  branches?: any[]; // Accept branches from parent
}

interface SourceType {
  id: number;
  sourceType: string;
}

interface SourceName {
  id: number;
  sourceName: string;
  sourceTypeId: number;
  branchId?: number;
}

const fields = [
  { label: "Production Volume (m³)", key: "productionVolume" },
    { label: "Operation Hours", key: "operationHours" },
    { label: "Number of Service Interruptions", key: "serviceInterruption" },
    { label: "Total Number of Hours of Service interruption", key: "totalHoursServiceInterruption" },
    { label: "Electricity Consumption", key: "electricityConsumption" },
    { label: "VFD Frequency (Hz)", key: "VFDFrequency" },
    { label: "Spot Flow (LPS)", key: "spotFlow" },
    { label: "Spot Pressure (PSI)", key: "spotPressure" },
    { label: "Time Spot Measurements were taken", key: "timeSpotMeasurements" },
    { label: "Line Voltage [L1-L2] (Volts)", key: "lineVoltage1" },
    { label: "Line Voltage [L2-L3] (Volts)", key: "lineVoltage2" },
    { label: "Line Voltage [L3-L1] (Volts)", key: "lineVoltage3" },
    { label: "Line Current [L1-L2] (Volts)", key: "lineCurrent1" },
    { label: "Line Current [L2-L3] (Volts)", key: "lineCurrent2" },
    { label: "Line Current [L3-L1] (Volts)", key: "lineCurrent3" },
];

const numericFieldKeys = [
  "productionVolume", "operationHours", "serviceInterruption", "totalHoursServiceInterruption",
  "electricityConsumption", "VFDFrequency", "spotFlow", "spotPressure", "lineVoltage1",
  "lineVoltage2", "lineVoltage3", "lineCurrent1", "lineCurrent2", "lineCurrent3"
];

const DailyDataSheetModal: React.FC<DailyDataSheetModalProps> = ({ show, onClose, onSubmit, areaId: initialAreaId, branches = [] }) => {
  const currentUser = useUserStore((state) => state.user);
  const [values, setValues] = useState<{ [key: string]: string }>(() => Object.fromEntries(fields.map(f => [f.key, ''])));
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  
  // Source Type and Source Name state
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);
  const [sourceNames, setSourceNames] = useState<SourceName[]>([]);
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');
  const [selectedSourceName, setSelectedSourceName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(initialAreaId ?? null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Fetch source types and source names on component mount
  useEffect(() => {
    if (show) {
      fetchSourceTypes();
    }
  }, [show]);

  // Fetch source names when source type changes
  useEffect(() => {
    if (selectedSourceType) {
      fetchSourceNames(parseInt(selectedSourceType));
    } else {
      setSourceNames([]);
    }
  }, [selectedSourceType]);

  // Update branchId when selectedSourceName changes
  useEffect(() => {
    if (selectedSourceName) {
      const selectedSourceNameObj = sourceNames.find(sn => sn.id.toString() === selectedSourceName);
      setBranchId(selectedSourceNameObj?.branchId ?? null);
      // Find the branch object and set areaId
      const selectedBranchObj = branches.find((b: any) => Number(b.id) === Number(selectedSourceNameObj?.branchId));
      setAreaId(selectedBranchObj?.areaId ?? null);
    } else {
      setBranchId(null);
      setAreaId(null);
    }
  }, [selectedSourceName, sourceNames, branches]);

  // Fetch required fields when branchId changes
  useEffect(() => {
    const fetchRequired = async () => {
      if (branchId) {
        try {
          const response = await requiredFieldsService.getRequiredFields(branchId);
          setRequiredFields(response.daily || []);
        } catch (err) {
          setRequiredFields([]);
        }
      } else {
        setRequiredFields([]);
      }
    };
    fetchRequired();
  }, [branchId]);





  const fetchSourceTypes = async () => {
    try {
      setLoading(true);
      const data = await sourceTypeService.getAllSourceType();
      setSourceTypes(data);
    } catch (error) {
      console.error('Error fetching source types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSourceNames = async (sourceTypeId: number) => {
    try {
      setLoading(true);
      
      const data = await sourceNameService.getAllSourceName(sourceTypeId, currentUser?.roleId);
      
      // For Central Admin (role 2) and Super Admin (role 1), filter client-side
      // because the backend API doesn't filter by sourceTypeId for these roles
      // Branch Admin (role 3) and Encoder (role 4) get filtered data from backend
      let filteredData = data;
      if (currentUser?.roleId === 1 || currentUser?.roleId === 2) {
        filteredData = data.filter((sn: any) => sn.sourceTypeId === sourceTypeId);
      }
      
      setSourceNames(filteredData);
    } catch (error) {
      console.error('Error fetching source names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceType = e.target.value;
    setSelectedSourceType(newSourceType);
    setSelectedSourceName(''); // Reset source name when source type changes
    // Immediately clear source names when source type changes
    setSourceNames([]);
  };

  const handleSourceNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSourceName(e.target.value);
  };

  if (!show) return null;

  const handleChange = (key: string, value: string) => {
    setValues(prev => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!selectedSourceType || !selectedSourceName) {
      alert('Please select both Source Type and Source Name');
      return;
    }
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    const submitValues: Record<string, any> = {
      ...values,
      sourceType: selectedSourceType,
      sourceName: selectedSourceName,
      date: selectedDate,
      branchId: branchId !== null ? String(branchId) : '',
      areaId: areaId != null ? String(areaId) : ''
    };
    // Convert numeric fields to numbers or null
    numericFieldKeys.forEach(field => {
      if (submitValues[field] === "" || submitValues[field] === undefined) {
        submitValues[field] = null;
      } else if (!isNaN(Number(submitValues[field]))) {
        submitValues[field] = Number(submitValues[field]);
      }
    });
    onSubmit(submitValues);
  };

  const handleClose = () => {
    // Reset form state when closing
    setValues(Object.fromEntries(fields.map(f => [f.key, ''])));
    setSubmitAttempted(false);
    setSelectedSourceType('');
    setSelectedSourceName('');
    setSourceNames([]);
    setBranchId(null);
    setAreaId(null);
    setSelectedDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-200 rounded-xl p-4 w-11/12 max-w-xl max-h-[80vh] overflow-y-auto shadow-lg relative flex flex-col items-center">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-4">Daily collection sheet</h2>
        <div className="flex flex-col items-center w-full mb-2">
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex w-full gap-2 mb-2">
            <select 
              className="border rounded px-2 py-1 flex-1"
              value={selectedSourceType}
              onChange={handleSourceTypeChange}
              disabled={loading}
            >
              <option value="">Source Type</option>
              {sourceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.sourceType}
                </option>
              ))}
            </select>
            <select 
              className="border rounded px-2 py-1 flex-1"
              value={selectedSourceName}
              onChange={handleSourceNameChange}
              disabled={!selectedSourceType || loading}
            >
              <option value="">Source Name</option>
              {sourceNames.map(name => (
                <option key={name.id} value={name.id}>
                  {name.sourceName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full flex flex-col gap-1 mb-4">
          {fields.map((field) => {
            const isRequired = requiredFields.includes(field.key);
            return (
              <div key={field.key} className="flex items-center justify-between w-full">
                <label className="mr-2 flex-1">
                  {field.label} {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type={numericFieldKeys.includes(field.key) ? "number" : "text"}
                  className={
    `border-2 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 
    ${isRequired ? 'border-black bg-white text-black focus:ring-black' : 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'}`}
                  value={values[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)}
                  required={isRequired}
                  disabled={!isRequired}
                />
              </div>
            );
          })}
        </div>
        <div className="flex w-full justify-center gap-3 mt-2">
          <button className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition" onClick={() => { setValues(Object.fromEntries(fields.map(f => [f.key, '']))); setSubmitAttempted(false); }}>Clear all</button>
          <button className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg shadow transition" onClick={handleSubmit}>Submit</button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Approve</button>
          <button className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Decline</button>
        </div>
      </div>
    </div>
  );
};

export default DailyDataSheetModal; 