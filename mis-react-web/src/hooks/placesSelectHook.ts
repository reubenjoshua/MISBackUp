import { useEffect, useMemo } from "react";
import { usePlaceStore } from "@/zustand/placesStore";


// custom hook for area and branches
// export const usePlacesSelect = (
//     selectedArea?:      string,
//     selectedBranch?:    string,
// ) => {
//     const areas = usePlaceStore ((state) => state.areas);
//     const branches = usePlaceStore ((state) => state.branches)
//     const fetchAreas = usePlaceStore ((state) => state.fetchAreas);
//     const fetchBranches = usePlaceStore ((state) => state.fetchBranches);

//     useEffect (() => {
//         if (areas.length === 0)
//         { fetchAreas(); }

//         if (branches.length === 0)
//         { fetchBranches(); }
//     }, [fetchAreas, areas.length, fetchBranches, branches.length]);

//     const areaOptions = useMemo (() => {
//         return areas.map ((area) => area.areaName).sort ();
//     }, [areas]);

//     const branchOptions = useMemo (() => {
//         if (!selectedArea && !selectedBranch)
//         {
//             return Array.from (new Set (areas.flatMap ((area) => Array.isArray (area.branches)
//                 ? area.branches.map ((branch) => branch.branchName)
//                 : []))).sort ();
//         }

//         if (selectedArea && !selectedBranch)
//         {
//             const area = areas.find ((area) => area.areaName === selectedArea);

//             return area?.branches.map((branch) => branch.branchName) ?? [];
//         }

//         if (!selectedArea && selectedBranch)
//         {
//             return Array.from (new Set (
//                 areas
//                     .flatMap ((area) => area.branches)
//                     .filter ((branch) => branch.branchName === selectedBranch)
//                     .map ((branch) => branch.branchName)
//             )).sort ();
//         }

//         const area = areas.find ((area) => area.areaName === selectedArea);

//         return area?.branches
//                 .filter ((branch) => branch.branchName === selectedBranch)
//                 .map ((branch) => branch.branchName) ?? [];
//     }, [areas, selectedArea, selectedBranch]);

//     return { areaOptions, branchOptions };
// };

export const usePlacesSelect = () => {
    const areas = usePlaceStore ((state) => state.areas);
    const branches = usePlaceStore ((state) => state.branches);

    const areaOptions = useMemo (() => {
        return Array.from (new Set (areas.map ((row) => row.areaName).filter (Boolean)));
    }, [areas]);

    const branchOptions = useMemo (() => {
        return Array.from (new Set (branches.map ((row) => row.branchName).filter (Boolean)));
    }, [branches]);

    return { areaOptions, branchOptions };
};