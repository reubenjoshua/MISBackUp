import { JSX } from "react";
import { textStyles } from "@/assets/styles";
import { BaseColumns } from "@/models/types/ObjectInterfaces";


export const ResultMap = <T extends object> (
    {
        results,
        columns,
        message,
    }: {
        results:    T [];
        columns:    BaseColumns <keyof T> [];
        message:    string | JSX.Element;
    }
) => {
    if (results.length === 0)
    {
        return (
            <tr>
                <td
                    colSpan = { columns.length }
                    className = { textStyles.tableNoResult }
                >
                    { message }
                </td>
            </tr>
        );
    }

    return (
        <>
            {
                results.map ((item, index) => (
                    <tr key = { index }>
                        {
                            columns
                                .filter ((col) => col.roleID)
                                .map ((col) => (
                                    <td
                                        key = { String (col.valueKey) }
                                        className = { textStyles.tableDisplayData }
                                    >
                                            {/* { String (user [col.valueKey as keyof T]) } */
                                                col.button
                                                    ? col.button (item)
                                                    : item [col.valueKey as keyof T] != null
                                                        ? String (item [col.valueKey as keyof T])
                                                        : ""
                                            }
                                    </td>
                                ))
                        }
                    </tr>
                ))
            }
        </>
    );
};