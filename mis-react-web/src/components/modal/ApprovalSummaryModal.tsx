import React from 'react';

interface ApprovalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyCount: number;
  monthlyCount: number;
}

export default function ApprovalSummaryModal({ 
  isOpen, 
  onClose, 
  dailyCount, 
  monthlyCount 
}: ApprovalSummaryModalProps) {
    
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-200 p-6 rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Approval Summary</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-black mr-2">●</span>
            <span>Approved Daily: {dailyCount}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-black mr-2">●</span>
            <span>Approved Monthly: {monthlyCount}</span>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}