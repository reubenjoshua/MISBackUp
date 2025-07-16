import React, { useState } from "react";
import { ApprovalData, Status } from "@/models/types/Status";

interface ApprovalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ApprovalData | null;
  onApprove: (recordId: number) => void;
  onReject: (recordId: number, remarks: string) => void;
  statuses: Status[];
  sourceTypes: { id: number; sourceType: string }[];
  sourceNames: { id: number; sourceName: string }[];
}

export default function ApprovalDetailModal({
  isOpen,
  onClose,
  data,
  onApprove,
  onReject,
  statuses,
  sourceTypes,
  sourceNames
}: ApprovalDetailModalProps) {
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !data) return null;

  const handleApprove = () => {
    onApprove(data.id);
    onClose();
  };

  const handleReject = () => {
    if (rejectionRemarks.trim()) {
      onReject(data.id, rejectionRemarks);
      setRejectionRemarks("");
      setShowRejectForm(false);
      onClose();
    }
  };

  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectionRemarks("");
  };

  const getSourceTypeName = (id: number) =>
    sourceTypes.find(st => st.id === id)?.sourceType || id;

  const getSourceName = (id: number) =>
    sourceNames.find(sn => sn.id === id)?.sourceName || id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Approval Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div>
              <label className="font-medium text-gray-700">Date:</label>
              <p className="text-gray-900">{data.date}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Area:</label>
              <p className="text-gray-900">{data.areaName}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Branch:</label>
              <p className="text-gray-900">{data.branchName}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Status:</label>
              <p className="text-gray-900">{data.statusName}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Source Type:</label>
              <p className="text-gray-900">{getSourceTypeName(data.sourceType)}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Source Name:</label>
              <p className="text-gray-900">{getSourceName(data.sourceName)}</p>
            </div>
          </div>

          {/* Production Data */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Production Data</h3>
            <div>
              <label className="font-medium text-gray-700">Production Volume:</label>
              <p className="text-gray-900">{data.productionVolume}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Operation Hours:</label>
              <p className="text-gray-900">{data.operationHours}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Service Interruption:</label>
              <p className="text-gray-900">{data.serviceInterruption}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Total Hours Service Interruption:</label>
              <p className="text-gray-900">{data.totalHoursServiceInterruption}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Electricity Consumption:</label>
              <p className="text-gray-900">{data.electricityConsumption}</p>
            </div>
          </div>
        </div>

        {/* Electrical Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Electrical Measurements</h3>
            <div>
              <label className="font-medium text-gray-700">VFD Frequency:</label>
              <p className="text-gray-900">{data.VFDFrequency}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Spot Flow:</label>
              <p className="text-gray-900">{data.spotFlow}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Spot Pressure:</label>
              <p className="text-gray-900">{data.spotPressure}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Time Spot Measurements:</label>
              <p className="text-gray-900">{data.timeSpotMeasurements}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Line Measurements</h3>
            <div>
              <label className="font-medium text-gray-700">Line Voltage 1:</label>
              <p className="text-gray-900">{data.lineVoltage1}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Line Voltage 2:</label>
              <p className="text-gray-900">{data.lineVoltage2}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Line Voltage 3:</label>
              <p className="text-gray-900">{data.lineVoltage3}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Line Current 1:</label>
              <p className="text-gray-900">{data.lineCurrent1}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Line Current 2:</label>
              <p className="text-gray-900">{data.lineCurrent2}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Line Current 3:</label>
              <p className="text-gray-900">{data.lineCurrent3}</p>
            </div>
          </div>
        </div>

        {/* Comments */}
        {data.comment && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold border-b pb-2 mb-3">Comments</h3>
            <p className="text-gray-900 bg-gray-50 p-3 rounded">{data.comment}</p>
          </div>
        )}

        {/* Rejection Remarks Form */}
        {showRejectForm && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Rejection Reason</h3>
            <textarea
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full p-3 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleReject}
                disabled={!rejectionRemarks.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-4 py-2 rounded"
              >
                Confirm Rejection
              </button>
              <button
                onClick={handleCancelReject}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded"
          >
            Close
          </button>
          {!showRejectForm && (
            <>
              <button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={handleRejectClick}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 