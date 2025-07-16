import React, { useState, useEffect } from "react";
import { usePlaceStore } from "@/zustand/placesStore";
import { useUserStore } from "@/zustand/userStore";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (branchId: number, sourceTypeId: number) => void;
  areas: { id: number; areaName: string; areaCode?: number; isActive?: boolean }[];
}

const sourceTypes = [
  { id: 1, name: 'Deep Well - Electric' },
  { id: 2, name: 'Deep Well - Genset Operated' },
  { id: 3, name: 'Shallow Well' },
  { id: 4, name: 'Spring - Gravity' },
  { id: 5, name: 'Spring - Power-driven' },
  { id: 6, name: 'Bulk' },
  { id: 7, name: 'WTP' },
  { id: 8, name: 'Booster' },
];

const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onNext, areas }) => {
  const { addBranch } = usePlaceStore();
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSourceTypes, setSelectedSourceTypes] = useState<string[]>([]);
  const JV_BRANCHES = [
  "Abucay", "Agoncillo", "Angeles City", "Asingan", "Atimonan", "Bacolod City", "Bago City", "Balungao", "Batac", "Batangas City", "Cabanatuan City", "Cadiz", "Camarines Norte", "Camiling", "City of San Fernando", "Daraga", "Dasmarinas City", "Dingras", "Floridablanca", "Gapan", "Gerona", "Guagua", "Himamaylan", "Ilocos Norte", "Iriga", "Jaen", "La Union", "Lemery", "Leyte Metropolitan", "Lingayen", "Lubao", "Maasin", "Mabalacat City", "Malaybalay", "Malolos", "Mapandan", "Marilao", "Mauban", "Mayantoc", "Metro Hilongos", "Metro Tayug", "Meycauayan City", "Munoz", "Nasugbu", "Orani", "Ozamis", "Panabo", "Paniqui", "Pinamungajan", "Porac", "Pozorrubio", "Quezon Metropolitan", "Rosales", "Rosario", "Samal", "San Antonio", "San Carlos City", "San Ildefonso", "San Jose Del Monte", "San Jose Mindoro", "San Pedro City", "San Quintin", "San Rafael", "Santa Cruz", "Silang", "Sorsogon", "Sta Maria", "Sto Thomas Batangas", "Sto Thomas Pangasinan", "Subic", "Surigao Metropolitan", "Tagaytay City", "Tarlac City", "Trece Martires", "Urdaneta", "Villasis"
];
  const currentUser = useUserStore(state => state.user);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedAreaId || !branchName.trim()) {
      setError("Please select an area and enter a branch name.");
      setLoading(false);
      return;
    }

    const result = await addBranch({
      areaId: selectedAreaId,
      branchName: branchName.trim(),
      isActive: true,
      sourceTypeIds: sourceTypes
    .filter(type => selectedSourceTypes.includes(type.name))
    .map(type => type.id)
    });

    setLoading(false);

    if (result.success) {
      setSelectedAreaId(null);
      setBranchName("");
      onClose();
      const firstSourceType = selectedSourceTypes[0];
      const sourceTypeObj = sourceTypes.find(st => st.name === firstSourceType);
      const sourceTypeId = sourceTypeObj ? sourceTypeObj.id : 0;
      onNext(result.branchId, sourceTypeId);
    } else {
      setError(result.error || "Failed to add branch.");
    }
  };

  const isJVArea = () => {
  const selectedArea = areas.find(area => area.id === selectedAreaId);
  return selectedArea?.areaName === "JV";
};

const canAccessJV = () => {
  return currentUser?.roleId === 1 || currentUser?.roleId === 2; // Super Admin or Central Admin
};

const shouldShowJVDropdown = () => {
  return isJVArea() && canAccessJV();
};

useEffect(() => {
  if (!shouldShowJVDropdown()) {
    setBranchName("");
  }
}, [selectedAreaId]);

if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-200 rounded-xl p-8 w-11/12 max-w-md max-h-[80vh] overflow-y-auto shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold text-center mb-6">Edit Branch</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="area" className="font-medium">Area</label>
            <select
              id="area"
              className="rounded border px-2 py-1"
              value={selectedAreaId || ""}
              onChange={e => setSelectedAreaId(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option key="default" value="">Select Area</option>
              {areas && areas.length > 0 ? areas.map((area, index) => (
                <option 
                  key={`area-${area.id || index}`} 
                  value={area.id || ""}
                >
                  {area.areaName || `Area ${index + 1}`}
                </option>
              )) : (
                <option key="no-areas" value="" disabled>No areas available</option>
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1">
  <label htmlFor="branchName" className="font-medium">Branch Name</label>
  {shouldShowJVDropdown() ? (
    <select
      id="branchName"
      className="rounded border px-2 py-1"
      value={branchName}
      onChange={e => setBranchName(e.target.value)}
      required
    >
      <option value="">Select Branch</option>
      {JV_BRANCHES.map(branch => (
        <option key={branch} value={branch}>
          {branch}
        </option>
      ))}
    </select>
  ) : (
    <input
      id="branchName"
      type="text"
      className="rounded border px-2 py-1"
      value={branchName}
      onChange={e => setBranchName(e.target.value)}
      required
    />
  )}
</div>
          <div className="mt-2 mb-2">
            <div className="font-medium text-center mb-2">Source Type</div>
            <div className="flex flex-col gap-1 items-start ml-4">
              {sourceTypes.map(type => (
                <label key={type.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-green-600 w-4 h-4"
                    checked={selectedSourceTypes.includes(type.name)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedSourceTypes([...selectedSourceTypes, type.name]);
                      } else {
                        setSelectedSourceTypes(selectedSourceTypes.filter(t => t !== type.name));
                      }
                    }}
                  />
                  {type.name}
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg shadow transition self-center"
            disabled={loading}
          >
            {loading ? "Saving..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BranchModal;
