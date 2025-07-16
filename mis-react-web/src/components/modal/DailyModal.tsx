import React, { useState } from "react";
import axios from "axios";

import { RoleType } from "@/models/types/User";
import { DailyType } from "@/models/types/DataTable";
import { requiredFieldsService } from "@/services/requiredFieldsService";

interface DailyModalProps {
    isOpen: boolean;
    userRole: RoleType;
    mode: "add" | "edit" | "review" | "view";
    data?: DailyType;
    onClose: () => void;
    onSubmit: (formData: DailyType) => void;
    onApprove?: () => void;
    onDecline?: (comment: string) => void;
    branchId?: number | null;
    checkedFields?: string[];
}

const fields = [
    { label: "Production Volume (m³)", key: "productionVolume" },
    { label: "Operation Hours", key: "operationHours" },
    { label: "Number of Service Interruptions", key: "serviceInterruption" },
    { label: "Total Number of Hours of Service interruption", key: "totalHoursServiceInterruption" },
    { label: "Electricity Consumption", key: "electricityConsumption" },
    { label: "VFD Frequency", key: "VFDFrequency" },
    { label: "Spot Flow", key: "spotFlow" },
    { label: "Spot Pressure", key: "spotPressure" },
    { label: "Time Spot Measurements were Taken", key: "timeSpotMeasurements" },
    { label: "Line Voltage [L1-L2]", key: "lineVoltage1" },
    { label: "Line Voltage [L2-L3]", key: "lineVoltage2" },
    { label: "Line Voltage [L3-L1]", key: "lineVoltage3" },
    { label: "Line Current [L1-L2]", key: "lineCurrent1" },
    { label: "Line Current [L2-L3]", key: "lineCurrent2" },
    { label: "Line Current [L3-L1]", key: "lineCurrent3" },
];

const DailyModal: React.FC<DailyModalProps> = ({
    isOpen,
    userRole,
    mode,
    data,
    onClose,
    onSubmit,
    onApprove,
    onDecline,
    branchId,
    checkedFields,
}) => {
    if (!isOpen) return null;

    const isAdmin = userRole.Id === 1 || userRole.Id === 2;
    const isReviewer = isAdmin || userRole.Id === 3;
    const isEncoder = userRole.Id === 3 || userRole.Id === 4;

    const [formData, setFormData] = useState<DailyType>(data || ({} as DailyType));
    const [declineComment, setDeclineComment] = useState<string>("");
    const [checked, setChecked] = useState<{ [key: string]: boolean }>(() => {
        const initial = Object.fromEntries(fields.map(f => [f.key, false]));
        if (checkedFields) {
            checkedFields.forEach(key => { initial[key] = true; });
        }
        return initial;
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isReadOnly = mode === "view" || (mode === "edit" && formData.Status === "Approved");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheck = (key: string) => {
        setChecked(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = () => onSubmit(formData);
    const handleApprove = () => onApprove && onApprove();
    const handleDecline = () => onDecline && onDecline(declineComment);

    const handleNext = async () => {
        setSaving(true);
        setError(null);
        const checkedFields = fields.filter(f => checked[f.key]).map(f => f.key);
        if (branchId) {
            try {
                await requiredFieldsService.saveRequiredFields(branchId, 'daily', checkedFields);
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-200 rounded-xl p-8 w-full max-w-2xl shadow-lg relative flex flex-col items-center">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-semibold text-center mb-6">Forms for Daily Datasheet</h2>
                <select className="rounded border px-2 py-1 mb-8 w-60 self-center">
                    <option>Source Type</option>
                </select>
                <div className="flex w-full justify-center gap-16 mb-8">
                    <div className="flex flex-col gap-3">
                        {fields.slice(0, 7).map((field) => (
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
                        {fields.slice(7).map((field) => (
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
                        onClick={onClose}
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

export default DailyModal;