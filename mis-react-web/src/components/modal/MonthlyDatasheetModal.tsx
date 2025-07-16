import React from 'react';
import { requiredFieldsService } from "@/services/requiredFieldsService";

interface MonthlyDatasheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  branchId?: number | null;
  checkedFields?: string[];
}

const sourceTypeOptions = [
  'Source Type',
  'Deep Well',
  'Spring',
  'Bulk',
  'WTP',
  'Booster',
];

const fields = [
  // { label: 'Electricity Consumption', key: 'electricityConsumption' },
  { label: 'Electricity Cost', key: 'electricityCost' },
  { label: 'Bulk Cost', key: 'bulkCost' },
  { label: 'Bulk Outtake', key: 'bulkOuttake' },
  { label: 'Name of Bulk Provider', key: 'bulkProvider' },
  { label: 'WTP Raw Water Cost', key: 'WTPCost' },
  { label: 'WTP Raw Water Source', key: 'WTPSource' },
  { label: 'WTP Raw Water Volume', key: 'WTPVolume' },
  { label: 'Method of Disinfection', key: 'disinfectionMode' },
  { label: 'Disinfectant Cost', key: 'disinfectantCost' },
  { label: 'Disinfection Amount', key: 'disinfectionAmount' },
  { label: 'Brand and Type of Disinfectant', key: 'disinfectionBrandType' },
  { label: 'Other Treatment Cost', key: 'otherTreatmentCost' },
  { label: 'Liters Consumed - Emergency Operations', key: 'emergencyLitersConsumed' },
  { label: 'Fuel Cost - Emergency Operations', key: 'emergencyFuelCost' },
  { label: 'Total Hours Used - Emergency Operations', key: 'emergencyTotalHoursUsed' },
  { label: 'Liters Consumed - Genset Operated', key: 'gensetLitersConsumed' },
  { label: 'Fuel Cost - Genset Operated', key: 'gensetFuelCost' },
];

const MonthlyDatasheetModal: React.FC<MonthlyDatasheetModalProps> = ({ isOpen, onClose, onPrevious, branchId, checkedFields }) => {
  const [checked, setChecked] = React.useState<{ [key: string]: boolean }>(() => {
    const initial = Object.fromEntries(fields.map(f => [f.key, false]));
    if (checkedFields) {
      checkedFields.forEach(key => { initial[key] = true; });
    }
    return initial;
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  if (!isOpen) return null;

  const handleCheck = (key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    const checkedFields = fields.filter(f => checked[f.key]).map(f => f.key);
    if (branchId) {
      try {
        await requiredFieldsService.saveRequiredFields(branchId, 'monthly', checkedFields);
        onClose();
      } catch (err) {
        setError('Failed to save required fields. Please try again.');
      } finally {
        setSaving(false);
      }
    } else {
      setError('Branch ID is missing.');
      setSaving(false);
    }
  };

  // Split fields for two-column layout
  const mid = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, mid);
  const rightFields = fields.slice(mid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-200 rounded-xl p-8 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg relative flex flex-col items-center">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full text-left mb-2 font-medium">Edit Branch</div>
        <h2 className="text-3xl font-semibold text-center mb-6">Forms for Monthly Datasheet</h2>
        <select className="rounded border px-2 py-1 mb-8 w-60 self-center">
          {sourceTypeOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="flex w-full justify-center gap-16 mb-8">
          <div className="flex flex-col gap-3">
            {leftFields.map(field => (
              <label key={field.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-green-600 w-4 h-4"
                  checked={checked[field.key]}
                  onChange={() => handleCheck(field.key)}
                />
                {field.label}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {rightFields.map(field => (
              <label key={field.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-green-600 w-4 h-4"
                  checked={checked[field.key]}
                  onChange={() => handleCheck(field.key)}
                />
                {field.label}
              </label>
            ))}
          </div>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex w-full justify-center gap-6 mt-4">
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-2 rounded-lg shadow transition"
            onClick={onPrevious}
            disabled={saving}
          >
            Previous
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg shadow transition"
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDatasheetModal; 