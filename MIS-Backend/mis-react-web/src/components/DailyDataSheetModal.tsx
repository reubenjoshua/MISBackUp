import React, { useState } from 'react';
import { DailyForm, MonthlyForm } from '../types/branch';
import { requiredFieldsService } from '../services/requiredFieldsService';

interface DatasheetModalProps {
  show: boolean;
  title: string;
  fields: DailyForm | MonthlyForm;
  setFields: (fields: DailyForm | MonthlyForm) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  branchId: number | null;
}

const DatasheetModal: React.FC<DatasheetModalProps> = ({
  show,
  title,
  fields,
  setFields,
  onPrevious,
  onNext,
  onClose,
  branchId,
}) => {
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!show) return null;

  const handleFieldCheck = (fieldName: string) => {
    setFields({
      ...fields,
      [fieldName]: !fields[fieldName as keyof typeof fields]
    });
    // Optionally clear value if unchecked
    setValues(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleNext = async () => {
    setSubmitAttempted(true);
    setError(null);
    const checkedFields = Object.entries(fields)
      .filter(([key, checked]) => checked)
      .map(([key]) => key);
    // Validate only checked fields
    const missing = checkedFields.filter(key => !values[key]);
    if (missing.length > 0) return;
    // Save required fields to backend
    if (branchId) {
      try {
        await requiredFieldsService.getRequiredFields(branchId, 'daily'); // Optionally fetch existing
        await requiredFieldsService.saveRequiredFields(branchId, 'daily', checkedFields);
      } catch (err) {
        setError('Failed to save required fields. Please try again.');
        return;
      }
    }
    onNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative">
        <h2 className="text-2xl font-semibold text-center mb-6">{title}</h2>
        {error && <div className="text-red-600 text-center mb-2">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(fields).map(([key, checked]) => {
            if (key === 'sourceType' || key === 'sourceName') return null;
            const hasError = submitAttempted && checked && !values[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={!!checked}
                  onChange={() => handleFieldCheck(key)}
                  className="mr-2"
                />
                <label htmlFor={key} className="capitalize flex-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="text"
                  value={values[key] || ''}
                  onChange={e => handleInputChange(key, e.target.value)}
                  disabled={!checked}
                  required={!!checked}
                  className={`border rounded px-2 py-1 w-32 ${checked ? 'bg-white' : 'bg-gray-100'} ${hasError ? 'border-red-500 bg-red-100' : ''}`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Next
          </button>
        </div>
        <button
          type="button"
          className="absolute top-2 right-4 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default DatasheetModal;