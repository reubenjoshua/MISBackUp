import React, { useState, useEffect } from "react";
import { activityAreaStyle, textStyles } from "@/assets/styles";
import BranchModal from "../components/modal/BranchModal";
import SourceNameModal from "../components/modal/SourceNameModal";
import DailyModal from "../components/modal/DailyModal";
import MonthlyDatasheetModal from "../components/modal/MonthlyDatasheetModal";
import { usePlaceStore } from "@/zustand/placesStore";
import { sourceNameService, sourceTypeService } from "@/services/sourceService";
import { requiredFieldsService } from "@/services/requiredFieldsService";
import { useUserStore } from "@/zustand/userStore";
import { usePageState } from "@/hooks/usePageState";

// Add this dropdown component inside the file (above the main component)
function EditFormsDropdown({ onEditDaily, onEditMonthly }: { onEditDaily: () => void; onEditMonthly: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="ml-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
        type="button"
      >
        Edit Forms ▼
      </button>
      {open && (
        <div className="absolute z-10 bg-white border rounded shadow mt-1 right-0">
          <button
            onClick={() => { setOpen(false); onEditDaily(); }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit Daily Form
          </button>
          <button
            onClick={() => { setOpen(false); onEditMonthly(); }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Edit Monthly Form
          </button>
        </div>
      )}
    </div>
  );
}

export default function ManageBranch() {
    const { branches, areas, fetchBranches, fetchAreas, toggleBranchActive, inactiveBranches, fetchInactiveBranches } = usePlaceStore();
    const currentUser = useUserStore((state) => state.user);
    const isBranchAdmin = currentUser?.roleName === 'Branch Admin';
    const isEncoder = currentUser?.roleName === 'Encoder';
    const branchId = currentUser?.branchId;

    // Filter branches for Branch Admins and Encoders
    const visibleBranches = (isBranchAdmin || isEncoder) && branchId ? branches.filter(b => b.id === branchId) : branches;
    const visibleInactiveBranches = (isBranchAdmin || isEncoder) && branchId ? inactiveBranches.filter(b => b.id === branchId) : inactiveBranches;

    // Page state management
    const { saveProperty, getProperty } = usePageState();
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>(getProperty('activeTab', 'active'));

    const [togglingBranches, setTogglingBranches] = useState<Set<number>>(new Set());
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [selectedSourceTypeId, setSelectedSourceTypeId] = useState<number | null>(null);

    // Modal state
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [isSourceNameModalOpen, setIsSourceNameModalOpen] = useState(false);
    const [isDailyDatasheetModalOpen, setIsDailyDatasheetModalOpen] = useState(false);
    const [isMonthlyDatasheetModalOpen, setIsMonthlyDatasheetModalOpen] = useState(false);

    const [editingBranch, setEditingBranch] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editModalSourceNames, setEditModalSourceNames] = useState<any[]>([]);
    const [loadingEditModal, setLoadingEditModal] = useState(false);

    // Add source name form state
    const [availableSourceTypes, setAvailableSourceTypes] = useState<any[]>([]);
    const [selectedSourceTypeForAdd, setSelectedSourceTypeForAdd] = useState<number | null>(null);
    const [newSourceName, setNewSourceName] = useState('');
    const [addingSourceName, setAddingSourceName] = useState(false);

    const [editFormsModalOpen, setEditFormsModalOpen] = useState<false | 'daily' | 'monthly'>(false);
    const [editFormsSource, setEditFormsSource] = useState<any>(null);
    const [editFormsCheckedFields, setEditFormsCheckedFields] = useState<string[]>([]);

    // Add a flag to request opening the Monthly modal after branchId is set
    const [shouldOpenMonthlyModal, setShouldOpenMonthlyModal] = useState(false);

    // --- Add state for renaming source name ---
    const [renamingSourceId, setRenamingSourceId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [renaming, setRenaming] = useState(false);

    // Fetch branches on component mount
    useEffect(() => {
        fetchBranches();
        fetchAreas();
    }, [fetchBranches, fetchAreas]);

    useEffect(() => {
      if (activeTab === 'inactive') {
        fetchInactiveBranches();
      }
    }, [activeTab, fetchInactiveBranches]);

    // Save page state when activeTab changes
    useEffect(() => {
        saveProperty('activeTab', activeTab);
    }, [activeTab, saveProperty]);

    // Map areaId to area name
    const getAreaName = (areaId: number) => {
        if (areaId === 1) return "Vista";
        if (areaId === 2) return "JV";
        if (areaId === 3) return "FPR";
        return `Area ${areaId}`;
    };

    const handleToggleActive = async (branch: any) => {
        if (togglingBranches.has(branch.id)) return; // Prevent multiple clicks
        
        setTogglingBranches(prev => new Set(prev).add(branch.id));
        
        try {
            const result = await toggleBranchActive(branch.id, !branch.isActive);
            
            if (result.success) {
                console.log(`Branch ${branch.isActive ? 'deactivated' : 'activated'} successfully`);
            } else {
                console.error('Failed to toggle branch status:', result.error);
            }
        } finally {
            setTogglingBranches(prev => {
                const newSet = new Set(prev);
                newSet.delete(branch.id);
                return newSet;
            });
        }
    };

    // Restore modal transition handlers
    const handleNextFromBranch = (branchId: number, sourceTypeId: number) => {
        setSelectedBranchId(branchId);
        setSelectedSourceTypeId(sourceTypeId);
        setIsBranchModalOpen(false);
        setIsSourceNameModalOpen(true);
    };
    const handlePreviousFromSourceName = () => {
        setIsSourceNameModalOpen(false);
        setIsBranchModalOpen(true);
    };
    const handleNextFromSourceName = () => {
        setIsSourceNameModalOpen(false);
        setIsDailyDatasheetModalOpen(true);
    };
    const handlePreviousFromDailyDatasheet = () => {
        setIsDailyDatasheetModalOpen(false);
        setIsSourceNameModalOpen(true);
    };
    const handleNextFromDailyDatasheet = () => {
        setShouldOpenMonthlyModal(true);
        setIsDailyDatasheetModalOpen(false);
    };
    const handlePreviousFromMonthlyDatasheet = () => {
        setIsMonthlyDatasheetModalOpen(false);
        setIsDailyDatasheetModalOpen(true);
    };
    const handleCloseMonthlyDatasheet = () => {
        setIsMonthlyDatasheetModalOpen(false);
    };

    // useEffect to open Monthly modal only after selectedBranchId is set
    useEffect(() => {
        if (shouldOpenMonthlyModal && selectedBranchId) {
            setIsMonthlyDatasheetModalOpen(true);
            setShouldOpenMonthlyModal(false);
        }
    }, [shouldOpenMonthlyModal, selectedBranchId]);

    const openEditModal = async (branch: any) => {
      setEditingBranch(branch);
      setIsEditModalOpen(true);
      setLoadingEditModal(true);
      try {
        const [allSourceNames, allSourceTypes] = await Promise.all([
          sourceNameService.getAllSourceName(undefined, currentUser?.roleId),
          sourceTypeService.getAllSourceType()
        ]);
        setEditModalSourceNames(allSourceNames.filter((sn: any) => sn.branchId === branch.id));
        setAvailableSourceTypes(allSourceTypes);
      } finally {
        setLoadingEditModal(false);
      }
    };
    const closeEditModal = () => {
      setIsEditModalOpen(false);
      setEditingBranch(null);
      setEditModalSourceNames([]);
      setSelectedSourceTypeForAdd(null);
      setNewSourceName('');
    };

    const handleAddSourceName = async () => {
      if (!selectedSourceTypeForAdd || !newSourceName.trim() || !editingBranch) {
        alert('Please select a source type and enter a source name.');
        return;
      }

      setAddingSourceName(true);
      try {
        await sourceNameService.createSourceName({
          branchId: editingBranch.id,
          sourceTypeId: selectedSourceTypeForAdd,
          sourceName: newSourceName.trim(),
          isActive: true
        });

        // Refresh the source names list
        const allSourceNames = await sourceNameService.getAllSourceName(undefined, currentUser?.roleId);
        setEditModalSourceNames(allSourceNames.filter((sn: any) => sn.branchId === editingBranch.id));
        
        // Reset form
        setSelectedSourceTypeForAdd(null);
        setNewSourceName('');
        alert('Source name added successfully!');
      } catch (error) {
        console.error('Error adding source name:', error);
        alert('Failed to add source name. Please try again.');
      } finally {
        setAddingSourceName(false);
      }
    };

    // --- Handler for Rename ---
    const handleRenameClick = (src: any) => {
      setRenamingSourceId(src.id);
      setRenameValue(src.sourceName);
    };
    const handleRenameCancel = () => {
      setRenamingSourceId(null);
      setRenameValue('');
    };
    const handleRenameSave = async (src: any) => {
      if (!renameValue.trim() || renaming) return;
      setRenaming(true);
      try {
        await sourceNameService.updateSourceName(src.id, {
          branchId: src.branchId,
          sourceTypeId: src.sourceTypeId,
          sourceName: renameValue.trim(),
          isActive: src.isActive,
        });
        // Refresh the source names list
        const allSourceNames = await sourceNameService.getAllSourceName(undefined, currentUser?.roleId);
        setEditModalSourceNames(allSourceNames.filter((sn: any) => sn.branchId === editingBranch.id));
        setRenamingSourceId(null);
        setRenameValue('');
      } catch (error) {
        alert('Failed to rename source name.');
      } finally {
        setRenaming(false);
      }
    };

    return (
        <main className={activityAreaStyle.mainTag}>
            <div className="header-section text-center mb-8">
                <h1 className="text-3xl font-bold">Manage Branch</h1>
            </div>
            <div className="flex justify-end mb-4">
                <button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                    onClick={() => setIsBranchModalOpen(true)}
                >
                    Add Branch
                </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded ${activeTab === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('active')}
              >
                Active Branches
              </button>
              <button
                className={`px-4 py-2 rounded ${activeTab === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('inactive')}
              >
                Inactive Branches
              </button>
            </div>
            <div className="w-full h-full overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            <th className={textStyles.tableHeader}>Branch</th>
                            <th className={textStyles.tableHeader}>Area</th>
                            <th className={textStyles.tableHeader}>Active</th>
                            <th className={textStyles.tableHeader}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeTab === 'active'
                          ? (visibleBranches.length === 0 ? (
                              <tr>
                                <td colSpan={4} className={textStyles.tableNoResult}>
                                  No branches found
                                </td>
                              </tr>
                            ) : (
                              visibleBranches
                                .filter(branch => branch.isActive)
                                .map((branch) => (
                                  <tr key={branch.id}>
                                    <td className={textStyles.tableDisplayData}>{branch.branchName}</td>
                                    <td className={textStyles.tableDisplayData}>{getAreaName(branch.areaId)}</td>
                                    <td className={textStyles.tableDisplayData}>
                                      <button
                                        onClick={() => handleToggleActive(branch)}
                                        disabled={togglingBranches.has(branch.id)}
                                        className={`relative w-12 h-6 rounded-full border-2 transition-colors duration-200
                                          ${branch.isActive ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}
                                          ${togglingBranches.has(branch.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        aria-label={branch.isActive ? "Deactivate branch" : "Activate branch"}
                                      >
                                        <span
                                          className={`absolute left-0 top-1/2 w-6 h-6 rounded-full shadow transform transition-transform duration-200
                                            ${branch.isActive ? 'translate-x-6 bg-green-700' : 'translate-x-0 bg-gray-700'} -translate-y-1/2`}
                                          />
                                      </button>
                                    </td>
                                    <td className={textStyles.tableDisplayData}>
                                      <button
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded-lg shadow transition"
                                        onClick={() => openEditModal(branch)}
                                      >
                                        Edit
                                      </button>
                                    </td>
                                  </tr>
                                ))
                            ))
                          : (visibleInactiveBranches.length === 0 ? (
                              <tr>
                                <td colSpan={4} className={textStyles.tableNoResult}>
                                  No branches found
                                </td>
                              </tr>
                            ) : (
                              visibleInactiveBranches.map((branch) => (
                                <tr key={branch.id}>
                                  <td className={textStyles.tableDisplayData}>{branch.branchName}</td>
                                  <td className={textStyles.tableDisplayData}>{getAreaName(branch.areaId)}</td>
                                  <td className={textStyles.tableDisplayData}>
                                    <button
                                      onClick={() => handleToggleActive(branch)}
                                      disabled={togglingBranches.has(branch.id)}
                                      className={`relative w-12 h-6 rounded-full border-2 transition-colors duration-200
                                        ${branch.isActive ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}
                                        ${togglingBranches.has(branch.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      aria-label={branch.isActive ? "Deactivate branch" : "Activate branch"}
                                    >
                                      <span
                                        className={`absolute left-0 top-1/2 w-6 h-6 rounded-full shadow transform transition-transform duration-200
                                          ${branch.isActive ? 'translate-x-6 bg-green-700' : 'translate-x-0 bg-gray-700'} -translate-y-1/2`}
                                      />
                                    </button>
                                  </td>
                                  <td className={textStyles.tableDisplayData}>
                                    <button
                                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded-lg shadow transition"
                                      onClick={() => openEditModal(branch)}
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ))}
                    </tbody>
                </table>
            </div>
            {/* Branch Modal */}
            <BranchModal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                onNext={handleNextFromBranch}
                areas={(areas || []).map(a => ({ id: a.id, areaName: a.areaName }))}
            />
            <SourceNameModal
                isOpen={isSourceNameModalOpen}
                onClose={handleNextFromSourceName}
                onPrevious={handlePreviousFromSourceName}
                branchId={selectedBranchId ?? 0}
                sourceTypeId={selectedSourceTypeId ?? 0}
            />
            <DailyModal
                isOpen={isDailyDatasheetModalOpen}
                userRole={{ Id: 1, roleName: 'Admin' }}
                mode="add"
                onClose={handleNextFromDailyDatasheet}
                onSubmit={() => {}}
                branchId={selectedBranchId}
            />
            <MonthlyDatasheetModal
                isOpen={isMonthlyDatasheetModalOpen}
                onClose={handleCloseMonthlyDatasheet}
                onPrevious={handlePreviousFromMonthlyDatasheet}
                branchId={selectedBranchId}
            />
            {/* Edit Branch Source Names Modal */}
            {isEditModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-gray-200 rounded-xl p-8 w-full max-w-4xl shadow-lg relative flex flex-col items-center">
                  <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    onClick={closeEditModal}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <div className="w-full text-left mb-2 font-medium">Edit Branch: {editingBranch?.branchName}</div>
                  <h2 className="text-3xl font-semibold text-center mb-6">Source Names</h2>
                  
                  {/* Add Source Name Form */}
                  <div className="w-full mb-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 text-center">Add New Source Name</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                        <select
                          value={selectedSourceTypeForAdd || ''}
                          onChange={(e) => setSelectedSourceTypeForAdd(e.target.value ? Number(e.target.value) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Source Type</option>
                          {availableSourceTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.sourceType}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                        <input
                          type="text"
                          value={newSourceName}
                          onChange={(e) => setNewSourceName(e.target.value)}
                          placeholder="Enter source name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <button
                          onClick={handleAddSourceName}
                          disabled={addingSourceName || !selectedSourceTypeForAdd || !newSourceName.trim()}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                        >
                          {addingSourceName ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Source Names Table */}
                  {loadingEditModal ? (
                    <div className="text-center my-4">Loading...</div>
                  ) : (
                    <div className="w-full mb-8" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <h3 className="text-xl font-semibold mb-4 text-center">Existing Source Names</h3>
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                          <tr>
                            <th className="bg-gray-300 px-4 py-2 rounded-l">ID</th>
                            <th className="bg-gray-300 px-4 py-2">Source Type</th>
                            <th className="bg-gray-300 px-4 py-2">Source Name</th>
                            <th className="bg-gray-300 px-4 py-2 rounded-r">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editModalSourceNames.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-4">No source names found for this branch.</td>
                            </tr>
                          ) : (
                            editModalSourceNames.map((src) => {
                              const sourceType = availableSourceTypes.find(st => st.id === src.sourceTypeId);
                              const isRenaming = renamingSourceId === src.id;
                              return (
                                <tr key={src.id}>
                                  <td className="text-center px-4 py-2">{src.id}</td>
                                  <td className="text-center px-4 py-2">{sourceType?.sourceType || 'Unknown'}</td>
                                  <td className="text-center px-4 py-2">
                                    {isRenaming ? (
                                      <input
                                        className="border rounded px-2 py-1 w-full"
                                        value={renameValue}
                                        onChange={e => setRenameValue(e.target.value)}
                                        disabled={renaming}
                                        autoFocus
                                      />
                                    ) : (
                                      src.sourceName
                                    )}
                                  </td>
                                  <td className="text-center px-4 py-2">
                                    <div className="flex gap-2 justify-center items-center">
                                      <EditFormsDropdown
                                        onEditDaily={async () => {
                                          setEditFormsSource(src);
                                          const response = await requiredFieldsService.getRequiredFields(editingBranch?.id);
                                          setEditFormsCheckedFields(response.daily || []);
                                          setEditFormsModalOpen('daily');
                                        }}
                                        onEditMonthly={async () => {
                                          setEditFormsSource(src);
                                          const response = await requiredFieldsService.getRequiredFields(editingBranch?.id);
                                          setEditFormsCheckedFields(response.monthly || []);
                                          setEditFormsModalOpen('monthly');
                                        }}
                                      />
                                      {isRenaming ? (
                                        <>
                                          <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded transition"
                                            onClick={() => handleRenameSave(src)}
                                            disabled={renaming || !renameValue.trim()}
                                          >
                                            Save
                                          </button>
                                          <button
                                            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-3 py-1 rounded transition"
                                            onClick={handleRenameCancel}
                                            disabled={renaming}
                                          >
                                            Cancel
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded transition"
                                          onClick={() => handleRenameClick(src)}
                                        >
                                          Rename
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                      {editFormsModalOpen === 'daily' && (
                        <DailyModal
                          isOpen={true}
                          userRole={{ Id: 1, roleName: 'Admin' }}
                          mode="edit"
                          onClose={() => setEditFormsModalOpen(false)}
                          onSubmit={() => {}}
                          branchId={editingBranch?.id}
                          checkedFields={editFormsCheckedFields}
                        />
                      )}
                      {editFormsModalOpen === 'monthly' && (
                        <MonthlyDatasheetModal
                          isOpen={true}
                          onClose={() => setEditFormsModalOpen(false)}
                          onPrevious={() => setEditFormsModalOpen(false)}
                          branchId={editingBranch?.id}
                          checkedFields={editFormsCheckedFields}
                        />
                      )}
                    </div>
                  )}
                  <div className="flex w-full justify-center gap-6 mt-4">
                    <button
                      className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-2 rounded-lg shadow transition"
                      onClick={closeEditModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
        </main>
    );
}