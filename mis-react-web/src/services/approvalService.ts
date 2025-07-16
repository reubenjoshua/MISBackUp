import api from "./getAPI";
import { ApprovalData, MonthlyApprovalData } from "@/models/types/Status";

export const approvalService = {
  // Get all daily data for approval (this will be filtered by status on the frontend)
  getApprovalData: async (): Promise<ApprovalData[]> => {
    const response = await api.get('/daily');
    return response.data;
  },

  // Get all monthly data for approval
  getMonthlyApprovalData: async (): Promise<MonthlyApprovalData[]> => {
    const response = await api.get('/approval-monthly-data');
    return response.data;
  },

  // Update approval status for daily data
  updateApprovalStatus: async (recordId: number, statusId: number, remarks: string): Promise<any> => {
    const response = await api.put(`/approval-data/${recordId}`, {
      status: statusId,
      remarks: remarks
    });
    return response.data;
  },

  // Update approval status for monthly data
  updateMonthlyApprovalStatus: async (recordId: number, statusId: number, remarks: string): Promise<any> => {
    const response = await api.put(`/approval-monthly-data/${recordId}`, {
      status: statusId,
      remarks: remarks
    });
    return response.data;
  },

  // Get all statuses for approval actions
  getAllStatuses: async () => {
    const response = await api.get('/status');
    return response.data;
  }
}; 