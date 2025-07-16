import { usePlacesSelect } from "@/hooks/placesSelectHook";
import { PlacesSelectProps } from "@/models/types/Filters";
import { usePlaceStore } from "@/zustand/placesStore";
import { useRunOnce } from "@/hooks/runOnce";

export const PlacesSelect = (
    {
        selectedArea,
        onAreaChange,
        selectedBranch,
        onBranchChange,
        disabled = false,
    }: PlacesSelectProps 
) => {
    const { areaOptions, branchOptions } = usePlacesSelect ();
    const fetchAreas = usePlaceStore ((state) => state.fetchAreas);
    const fetchBranches = usePlaceStore ((state) => state.fetchBranches);

    useRunOnce (() => {
        fetchAreas();
        fetchBranches();
    }, {dependency: [fetchAreas, fetchBranches]});

    return (
        <div className = "places-dropdown">
            {
                onAreaChange && (
                    <select
                        value = { selectedArea }
                        onChange = { (e) => onAreaChange (e.target.value) }
                        disabled = { disabled }
                        className = "rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm bg-white">
                        <option>Select area</option>
                        {
                            areaOptions.map ((name) => (
                                <option
                                    key = { name }
                                    value = { name }>
                                    { name }
                                </option>
                            ))
                        }
                    </select>
                )
            }

            {
                onBranchChange && (
                    <select
                        value = { selectedBranch }
                        onChange = { (e) => onBranchChange (e.target.value) }
                        disabled = { disabled }
                        className = "rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm bg-white">
                        <option>Select branch</option>
                        {
                            branchOptions.map ((name) => (
                                <option
                                    key = { name }
                                    value = { name }>
                                    { name }
                                </option>
                            ))
                        }
                    </select>
                )
            }
        </div>
    );
};