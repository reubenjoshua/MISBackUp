import api from './getAPI';

export const requiredFieldsService = {
  getRequiredFields: async (branchId: number) => {
  const response = await api.get(`/required-fields/${branchId}`);
  return response.data;
  },
  saveRequiredFields: async (branchId: number, type: 'daily' | 'monthly', fields: string[]) => {
       const response = await api.post(`/required-fields/${branchId}`, { type, fields });
       return response.data;
  },
}; 