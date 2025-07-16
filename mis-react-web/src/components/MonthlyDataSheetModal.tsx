import React from 'react';
import { sourceTypeService, sourceNameService } from "@/services/sourceService";
import api from "@/services/getAPI";
import { useUserStore } from '@/zustand/userStore';

interface MonthlyDataSheetModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const leftFields = [
  { label: 'Production Volume (m³)', key: 'productionVolume' },
  { label: 'Operation Hours', key: 'operationHours' },
  { label: 'Number of Service Interruptions', key: 'serviceInterruption' },
  { label: 'Total Number of Hours of service interruption', key: 'totalHoursServiceInterruption' },
  { label: 'Electricity Consumption', key: 'electricityConsumption' },
  { label: 'Electricity Cost', key: 'electricityCost' },
  { label: 'Bulk Cost', key: 'bulkCost' },
  { label: 'Bulk Outtake', key: 'bulkOuttake' },
  { label: 'Name of Bulk provider', key: 'bulkProvider' },
  { label: 'WTP Raw Water Cost', key: 'WTPCost' },
  { label: 'WTP Raw Water Source', key: 'WTPSource' },
];

const rightFields = [
  { label: 'WTP Raw Water Volume', key: 'WTPVolume' },
  { label: 'Method of Disinfection', key: 'disinfectionMode' },
  { label: 'Disinfectant Cost', key: 'disinfectantCost' },
  { label: 'Disinfectan amount', key: 'disinfectionAmount' },
  { label: 'Brand and Type of Disinfectant', key: 'disinfectionBrandType' },
  { label: 'Other Treatment Cost', key: 'otherTreatmentCost' },
  { label: 'Liters consumed - Emergency Operations', key: 'emergencyLitersConsumed' },
  { label: 'Fuel Cost - Emergency Operations', key: 'emergencyFuelCost' },
  { label: 'Total Hours used - Emergency Operations', key: 'emergencyTotalHoursUsed' },
  { label: 'Liters consumed - Genset Operated', key: 'gensetLitersConsumed' },
  { label: 'Fuel Cost - Genset Operated', key: 'gensetFuelCost' },
];

const MonthlyDataSheetModal: React.FC<MonthlyDataSheetModalProps> = ({ show, onClose, onSubmit }) => {
  const currentUser = useUserStore((state) => state.user);
  const [sourceTypes, setSourceTypes] = React.useState<{ id: number; sourceType: string }[]>([]);
  const [sourceNames, setSourceNames] = React.useState<{ id: number; sourceName: string; branchId?: number }[]>([]);
  const [selectedSourceTypeId, setSelectedSourceTypeId] = React.useState<number | null>(null);
  const [selectedSourceNameId, setSelectedSourceNameId] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<string>("");
  const [selectedYear, setSelectedYear] = React.useState<string>("");
  const [autoSum, setAutoSum] = React.useState({
    productionVolume: "",
    operationHours: "",
    serviceInterruption: "",
    totalHoursServiceInterruption: "",
    electricityConsumption: ""
  });
  const [requiredFields, setRequiredFields] = React.useState<string[]>([]);
  const [fieldValues, setFieldValues] = React.useState<{ [key: string]: string }>({});
  const [validationStatus, setValidationStatus] = React.useState<{
    isValid: boolean;
    message?: string;
    completedDays?: number;
    totalDays?: number;
  } | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      sourceTypeService.getAllSourceType().then(setSourceTypes);
      setSourceNames([]);
      setSelectedSourceTypeId(null);
      setSelectedSourceNameId(null);
      setSelectedMonth("");
      setSelectedYear("");
      setAutoSum({
        productionVolume: "",
        operationHours: "",
        serviceInterruption: "",
        totalHoursServiceInterruption: "",
        electricityConsumption: ""
      });
      setRequiredFields([]);
      setFieldValues({});
    }
  }, [show]);

  React.useEffect(() => {
    if (selectedSourceTypeId) {
      sourceNameService.getAllSourceName(selectedSourceTypeId, currentUser?.roleId).then(setSourceNames);
    } else {
      setSourceNames([]);
      setSelectedSourceNameId(null);
    }
  }, [selectedSourceTypeId, currentUser?.roleId]);

  // Fetch required fields for monthly when branchId is determined
  React.useEffect(() => {
    if (selectedSourceNameId) {
      const selectedSourceNameObj = sourceNames.find(sn => sn.id === selectedSourceNameId);
      const branchId = selectedSourceNameObj?.branchId;
      if (branchId) {
        api.get(`/required-fields/${branchId}`).then(res => {
          setRequiredFields(res.data.monthly || []);
        }).catch(() => setRequiredFields([]));
      } else {
        setRequiredFields([]);
      }
    } else {
      setRequiredFields([]);
    }
  }, [selectedSourceNameId, sourceNames]);

  React.useEffect(() => {
    // Only fetch if all required selectors are set
    if (selectedSourceTypeId && selectedSourceNameId && selectedMonth && selectedYear) {
      const selectedSourceNameObj = sourceNames.find(sn => sn.id === selectedSourceNameId);
      const branchId = selectedSourceNameObj?.branchId;
      if (branchId) {
        api.get('/daily-sums', {
          params: {
            branchId,
            sourceTypeId: selectedSourceTypeId,
            month: selectedMonth,
            year: selectedYear
          }
        }).then(res => {
          setAutoSum({
            productionVolume: res.data.productionVolume,
            operationHours: res.data.operationHours,
            serviceInterruption: res.data.serviceInterruption,
            totalHoursServiceInterruption: res.data.totalHoursServiceInterruption,
            electricityConsumption: res.data.electricityConsumption
          });
        }).catch(() => {
          setAutoSum({
            productionVolume: "",
            operationHours: "",
            serviceInterruption: "",
            totalHoursServiceInterruption: "",
            electricityConsumption: ""
          });
        });
      }
    }
  }, [selectedSourceTypeId, selectedSourceNameId, selectedMonth, selectedYear, sourceNames]);

  // Check validation when form fields change
  React.useEffect(() => {
    if (selectedSourceNameId && selectedMonth && selectedYear) {
      setIsValidating(true);
      checkDailyCompletion().then(result => {
        setValidationStatus(result);
        setIsValidating(false);
      });
    } else {
      setValidationStatus(null);
    }
  }, [selectedSourceNameId, selectedMonth, selectedYear]);

  // Pre-validation function to check daily completion
  const checkDailyCompletion = async () => {
    if (!selectedSourceNameId || !selectedMonth || !selectedYear) {
      return { isValid: false, message: "Please select source name, month, and year" };
    }

    const selectedSourceNameObj = sourceNames.find(sn => sn.id === selectedSourceNameId);
    const branchId = selectedSourceNameObj?.branchId;

    if (!branchId) {
      return { isValid: false, message: "Could not determine branch for selected source name" };
    }

    try {
      const response = await api.post('/validate-daily-completion', {
        branchId,
        sourceName: selectedSourceNameId,
        year: selectedYear,
        month: selectedMonth
      });

      return response.data;
    } catch (err: any) {
      console.error('Error checking daily completion:', err);
      return { 
        isValid: false, 
        message: "Error checking daily completion. Please try again." 
      };
    }
  };

  const handleSubmit = async () => {
    const selectedSourceNameObj = sourceNames.find(sn => sn.id === selectedSourceNameId);
    const branchId = selectedSourceNameObj?.branchId;

    if (!branchId || !selectedSourceTypeId || !selectedSourceNameId || !selectedMonth || !selectedYear) {
      alert("Please fill all required selectors.");
      return;
    }

    // Validate Bulk Outtake field when source type is Bulk and field is required
    const isBulkSourceType = selectedSourceTypeId === 6;
    const isBulkOuttakeRequired = requiredFields.includes('bulkOuttake');
    
    if (isBulkSourceType && isBulkOuttakeRequired) {
      const bulkOuttakeValue = fieldValues['bulkOuttake'];
      if (!bulkOuttakeValue || bulkOuttakeValue === "") {
        alert("Please select a value for Bulk Outtake field.");
        return;
      }
      if (!['WTP', 'Distribution Line'].includes(bulkOuttakeValue)) {
        alert("Please select either 'WTP' or 'Distribution Line' for Bulk Outtake.");
        return;
      }
    }

    // Build the form data
    const formData: any = {
      branchId,
      sourceType: selectedSourceTypeId,
      sourceName: selectedSourceNameId,
      month: selectedMonth,
      year: selectedYear,
    };

    // Always include auto-sum fields
    Object.keys(autoSum).forEach(key => {
      formData[key] = autoSum[key as keyof typeof autoSum];
    });

    // Add required fields (for all other fields)
    requiredFields.forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(autoSum, key)) {
        formData[key] = fieldValues[key] || "";
      }
    });

    console.log('autoSum:', autoSum);
    console.log('fieldValues:', fieldValues);
    console.log('requiredFields:', requiredFields);
    console.log('formData to be sent:', formData);

    try {
      const response = await api.post('/monthly', formData);
      
      // Check if the response indicates validation failure
      if (response.data && response.data.validation && !response.data.validation.isValid) {
        alert(response.data.message || 'Daily completion validation failed');
        return;
      }
      
      onClose();
    } catch (err: any) {
      // Handle validation errors from backend
      if (err.response?.status === 400 && err.response?.data?.validation) {
        const validationData = err.response.data.validation;
        alert(validationData.errorMessage || 'Daily completion validation failed');
      } else {
        alert('Failed to save monthly data: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-200 rounded-xl p-4 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg relative flex flex-col items-center">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold text-center mb-4">Monthly Collection Sheet</h2>
        <div className="flex flex-col items-center w-full mb-2">
          <label className="text-sm font-medium mb-1">Branch</label>
          <select
            className="border rounded px-2 py-1 mb-2"
            value={currentUser?.branchId || ''}
            disabled={currentUser?.roleId === 3 || currentUser?.roleId === 4}
            style={{ backgroundColor: (currentUser?.roleId === 3 || currentUser?.roleId === 4) ? '#f3f4f6' : undefined }}
          >
            {(currentUser?.roleId === 3 || currentUser?.roleId === 4) ? (
              <option value={currentUser.branchId}>{currentUser.branchName}</option>
            ) : (
              <option value="">Select Branch</option>
            )}
          </select>
          <input
            type="month"
            className="border rounded px-2 py-1 mb-1"
            value={selectedYear && selectedMonth ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : ""}
            onChange={e => {
              const [year, month] = e.target.value.split("-");
              setSelectedYear(year);
              setSelectedMonth(month);
            }}
          />
          <div className="flex w-full gap-2 mb-2">
            <select
              className="border rounded px-2 py-1 flex-1"
              value={selectedSourceTypeId || ''}
              onChange={e => setSelectedSourceTypeId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Source Type</option>
              {sourceTypes.map(st => (
                <option key={st.id} value={st.id}>{st.sourceType}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1 flex-1"
              value={selectedSourceNameId || ''}
              onChange={e => setSelectedSourceNameId(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedSourceTypeId}
            >
              <option value="">Source Name</option>
              {sourceNames.map(sn => (
                <option key={sn.id} value={sn.id}>{sn.sourceName}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Validation Status Display */}
        {validationStatus && (
          <div className={`w-full p-3 rounded-lg mb-4 ${
            validationStatus.isValid 
              ? 'bg-green-100 border border-green-400 text-green-800' 
              : 'bg-red-100 border border-red-400 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <strong>
                  {validationStatus.isValid ? '✅ Ready to Submit' : '❌ Cannot Submit'}
                </strong>
                {validationStatus.completedDays !== undefined && validationStatus.totalDays !== undefined && (
                  <div className="text-sm mt-1">
                    {validationStatus.completedDays} of {validationStatus.totalDays} days completed
                  </div>
                )}
                {!validationStatus.isValid && validationStatus.message && (
                  <div className="text-sm mt-1">
                    {validationStatus.message}
                  </div>
                )}
              </div>
              {isValidating && (
                <div className="text-sm text-gray-600">
                  Validating...
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="w-full flex flex-row gap-8 mb-4">
          <div className="flex flex-col gap-1 flex-1">
            {leftFields.map((field) => {
              const isRequired = requiredFields.includes(field.key);
              const inputClass = isRequired
                ? "border-2 border-blue-500 bg-blue-50 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                : "border-2 border-gray-300 bg-gray-100 rounded px-2 py-1 w-40 opacity-60 cursor-not-allowed";
              
              // Special handling for Bulk Outtake field
              if (field.key === 'bulkOuttake') {
                const isBulkSourceType = selectedSourceTypeId === 6; // Bulk source type ID
                const shouldShowDropdown = isBulkSourceType && isRequired;
                
                return (
                  <div key={field.label} className="flex items-center justify-between w-full mb-1">
                    <label className="mr-2">
                      {field.label}
                      {isBulkSourceType && isRequired && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {shouldShowDropdown ? (
                      <select
                        className={inputClass}
                        value={fieldValues[field.key] || ""}
                        onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                        required={isRequired}
                      >
                        <option value="">Select Option</option>
                        <option value="WTP">WTP</option>
                        <option value="Distribution Line">Distribution Line</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        className={inputClass}
                        value={fieldValues[field.key] || ""}
                        onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                        disabled={!isRequired}
                        placeholder={isBulkSourceType && !isRequired ? "Not required for this source type" : ""}
                      />
                    )}
                  </div>
                );
              }
              
              if (Object.prototype.hasOwnProperty.call(autoSum, field.key)) {
                return (
                  <div key={field.label} className="flex items-center justify-between w-full mb-1">
                    <label className="mr-2">{field.label}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={autoSum[field.key as keyof typeof autoSum]}
                      readOnly
                      disabled={!isRequired}
                    />
                  </div>
                );
              }
              return (
                <div key={field.label} className="flex items-center justify-between w-full mb-1">
                  <label className="mr-2">{field.label}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={fieldValues[field.key] || ""}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    disabled={!isRequired}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {rightFields.map((field) => {
              const isRequired = requiredFields.includes(field.key);
              const inputClass = isRequired
                ? "border-2 border-blue-500 bg-blue-50 rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                : "border-2 border-gray-300 bg-gray-100 rounded px-2 py-1 w-40 opacity-60 cursor-not-allowed";
              return (
                <div key={field.label} className="flex items-center justify-between w-full mb-1">
                  <label className="mr-2">{field.label}</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={fieldValues[field.key] || ""}
                    onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                    disabled={!isRequired}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* No Add Comments section here */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          className="w-full"
        >
          <div className="flex w-full justify-center gap-3 mt-2">
            <button type="button" className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Clear all</button>
            <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-4 py-2 rounded-lg shadow transition" disabled={!validationStatus || !validationStatus.isValid || isValidating}>Submit</button>
            <button type="button" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Approve</button>
            <button type="button" className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Decline</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonthlyDataSheetModal; 