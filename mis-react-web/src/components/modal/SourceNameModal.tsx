import React, { useEffect, useState } from 'react';
import { sourceNameService } from '@/services/sourceService';
import type { SourceName } from '@/models/types/Branch';
import { useUserStore } from '@/zustand/userStore';

interface SourceNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  branchId: number;
  sourceTypeId: number;
}

const SourceNameModal: React.FC<SourceNameModalProps> = ({
  isOpen,
  onClose,
  onPrevious,
  branchId,
  sourceTypeId,
}) => {
  const currentUser = useUserStore((state) => state.user);
  const [sourceNames, setSourceNames] = useState<SourceName[]>([]);
  const [newSourceName, setNewSourceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [renamingSource, setRenamingSource] = useState<SourceName | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Fetch source names for this branch and source type
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    sourceNameService.getAllSourceName(undefined, currentUser?.roleId)
      .then((data) => {
        // For branch admins, filter by their assigned branch
        // For central admins, filter by the branch being edited
        const filterBranchId = currentUser?.roleId === 3 ? currentUser.branchId : branchId;
        
        setSourceNames(
          data.filter(
            (sn: SourceName) =>
              sn.branchId === filterBranchId && sn.sourceTypeId === sourceTypeId
          )
        );
      })
      .catch(() => setError('Failed to fetch source names'))
      .finally(() => setLoading(false));
  }, [isOpen, branchId, sourceTypeId, currentUser?.roleId, currentUser?.branchId]);

  // Add a new source name
  const handleAdd = async () => {
    if (!newSourceName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      
      await sourceNameService.createSourceName({
        branchId,
        sourceTypeId,
        sourceName: newSourceName,
        isActive: true,
      });
      // Refresh list after adding
      const updated = await sourceNameService.getAllSourceName(undefined, currentUser?.roleId);
      
      // Apply the same filtering logic
      const filterBranchId = currentUser?.roleId === 3 ? currentUser.branchId : branchId;
      
      setSourceNames(
        updated.filter(
          (sn: SourceName) =>
            sn.branchId === filterBranchId && sn.sourceTypeId === sourceTypeId
        )
      );
      setNewSourceName('');
    } catch (e) {
      setError('Failed to add source name');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        <div className="w-full text-left mb-2 font-medium">
          Add Source Name for Branch ID: {branchId}, Source Type ID: {sourceTypeId}
        </div>
        <h2 className="text-3xl font-semibold text-center mb-6">Add a Source Name</h2>
        {loading ? (
          <div className="text-center my-4">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center my-4">{error}</div>
        ) : (
          <div className="w-full mb-8" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="bg-gray-300 px-4 py-2 rounded-l">ID</th>
                  <th className="bg-gray-300 px-4 py-2">Source Name</th>
                  <th className="bg-gray-300 px-4 py-2 rounded-r">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sourceNames.map((src) => (
                  <tr key={src.id}>
                    <td className="text-center px-4 py-2">{src.id}</td>
                    <td className="text-center px-4 py-2">{src.sourceName}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="inline-flex gap-2">
                        <button
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-lg shadow transition"
  onClick={() => {
    setRenamingSource(src);
    setRenameValue(src.sourceName);
  }}
>
  Rename
</button>
                        <button className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-1 rounded-lg shadow transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex w-full justify-center mb-8 gap-2">
          <input
            type="text"
            className="rounded border px-2 py-1 w-1/2"
            value={newSourceName}
            onChange={e => setNewSourceName(e.target.value)}
            placeholder="Enter new source name"
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            onClick={handleAdd}
            disabled={loading || !newSourceName.trim()}
          >
            Add
          </button>
        </div>
        <div className="flex w-full justify-center gap-6 mt-4">
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-2 rounded-lg shadow transition"
            onClick={onPrevious}
          >
            Previous
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg shadow transition"
            onClick={onClose}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceNameModal;