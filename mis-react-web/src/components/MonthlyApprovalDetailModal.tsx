import React, { useState } from "react";
import { MonthlyApprovalData, Status } from "@/models/types/Status";

interface MonthlyApprovalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MonthlyApprovalData | null;
  onApprove: (recordId: number) => void;
  onReject: (recordId: number, remarks: string) => void;
  statuses: Status[];
}

export default function MonthlyApprovalDetailModal({
  isOpen,
  onClose,
  data,
  onApprove,
  onReject,
  statuses
}: MonthlyApprovalDetailModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Monthly Approval Details</h2>
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
              <label className="font-medium text-gray-700">Month/Year:</label>
              <p className="text-gray-900">{data.month} {data.year}</p>
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
              <p className="text-gray-900">{data.sourceTypeName}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Source Name:</label>
              <p className="text-gray-900">{data.sourceNameName}</p>
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

        {/* Auto Sum Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Auto-Sum Data (From Daily)</h3>
            <div>
              <label className="font-medium text-gray-700">Production Volume Auto-Sum:</label>
              <p className="text-gray-900">{data.productionVolumeAutoSum}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Operation Hours Auto-Sum:</label>
              <p className="text-gray-900">{data.operationHoursAutoSum}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Service Interruption Auto-Sum:</label>
              <p className="text-gray-900">{data.serviceInterruptionAutoSum}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Total Hours Service Interruption Auto-Sum:</label>
              <p className="text-gray-900">{data.totalHoursServiceInterruptionAutoSum}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Electricity Consumption Auto Sum:</label>
              <p className="text-gray-900">{data.electricityConsumption}</p>
            </div>
          </div>

          {/* Cost Data */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Cost Information</h3>
            <div>
              <label className="font-medium text-gray-700">Electricity Cost:</label>
              <p className="text-gray-900">{data.electricityCost?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Bulk Cost:</label>
              <p className="text-gray-900">{data.bulkCost?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Bulk Outtake:</label>
              <p className="text-gray-900">{data.bulkOuttake}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Bulk Provider:</label>
              <p className="text-gray-900">{data.bulkProvider}</p>
            </div>
          </div>
        </div>

        {/* WTP and Treatment Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">WTP Information</h3>
            <div>
              <label className="font-medium text-gray-700">WTP Cost:</label>
              <p className="text-gray-900">{data.WTPCost?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">WTP Source:</label>
              <p className="text-gray-900">{data.WTPSource}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">WTP Volume:</label>
              <p className="text-gray-900">{data.WTPVolume}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Disinfection Mode:</label>
              <p className="text-gray-900">{data.disinfectionMode}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Disinfectant Cost:</label>
              <p className="text-gray-900">{data.disinfectantCost?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Disinfection Amount:</label>
              <p className="text-gray-900">{data.disinfectionAmount}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Disinfection Brand Type:</label>
              <p className="text-gray-900">{data.disinfectionBrandType}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Other Treatment Cost:</label>
              <p className="text-gray-900">{data.otherTreatmentCost?.toLocaleString()}</p>
            </div>
          </div>

          {/* Emergency and Genset Data */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">Emergency & Genset</h3>
            <div>
              <label className="font-medium text-gray-700">Emergency Liters Consumed:</label>
              <p className="text-gray-900">{data.emergencyLitersConsumed}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Emergency Fuel Cost:</label>
              <p className="text-gray-900">{data.emergencyFuelCost?.toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Emergency Total Hours Used:</label>
              <p className="text-gray-900">{data.emergencyTotalHoursUsed}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Genset Liters Consumed:</label>
              <p className="text-gray-900">{data.gensetLitersConsumed}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Genset Fuel Cost:</label>
              <p className="text-gray-900">{data.gensetFuelCost?.toLocaleString()}</p>
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