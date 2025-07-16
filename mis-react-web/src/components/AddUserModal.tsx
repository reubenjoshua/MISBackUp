import React, { useState } from 'react';
import { UserRegistrationType } from '@/models/types/User';
import { useUserStore } from '@/zustand/userStore';

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (success: boolean) => void;
  areas: { id: number; areaName: string }[];
  roles: { id: number; roleName: string }[];
  branches: { id: number; branchName: string }[];
}

const AddUserModal: React.FC<AddUserModalProps> = ({ 
  show, 
  onClose, 
  onSubmit, 
  areas, 
  roles, 
  branches 
}) => {
  const currentUser = useUserStore((state) => state.user);
  const [formData, setFormData] = useState<UserRegistrationType>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userName: '',
    roleId: 0,
    areaId: undefined,
    branchId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserRegistrationType, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // NEW: Validation function for role-based requirements
  const validateForm = (): string | null => {
    const selectedRole = roles.find(role => role.id === formData.roleId);
    
    // Check if role is selected
    if (!formData.roleId) {
      return 'Please select a role';
    }

    // Role-specific validation
    if (formData.roleId === 3 || formData.roleId === 4) {
      // Branch Admin (3) and Encoder (4) MUST have a branch
      if (!formData.branchId) {
        return `${selectedRole?.roleName || 'This role'} requires a branch assignment`;
      }
      // Branch Admin (3) and Encoder (4) MUST have an area
      if (!formData.areaId) {
        return `${selectedRole?.roleName || 'This role'} requires an area assignment`;
      }
    }
    
    // Super Admin (1) and Central Admin (2) can have NULL branch and area
    // No additional validation needed for these roles

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // NEW: Validate form before submission
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const { createUser } = useUserStore.getState();
      const result = await createUser(formData);
      
      if (result.success) {
        onSubmit(true);
        handleClear();
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      userName: '',
      roleId: 0,
      areaId: undefined,
      branchId: undefined,
    });
    setError(null);
  };

  // Auto-select branch and area for branch admins and encoders when modal opens
  React.useEffect(() => {
    if (show && (currentUser?.roleId === 3 || currentUser?.roleId === 4)) {
      setFormData(prev => ({
        ...prev,
        branchId: currentUser?.branchId,
        areaId: currentUser?.areaId
      }));
    }
  }, [show, currentUser?.roleId, currentUser?.branchId, currentUser?.areaId]);

  // NEW: Get selected role for conditional rendering
  const selectedRole = roles.find(role => role.id === formData.roleId);
  const isBranchRequired = formData.roleId === 3 || formData.roleId === 4; // Branch Admin or Encoder
  const isAreaRequired = formData.roleId === 3 || formData.roleId === 4; // Branch Admin or Encoder

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-200 rounded-xl p-6 w-11/12 max-w-md max-h-[80vh] overflow-y-auto shadow-lg relative flex flex-col items-center">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold text-center mb-6">Add a User</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
          <label className="flex flex-col font-medium">
            Role *
            <select 
              className="border rounded px-2 py-1 mt-1"
              value={formData.roleId}
              onChange={(e) => handleInputChange('roleId', Number(e.target.value))}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.roleName}</option>
              ))}
            </select>
          </label>
          
          <label className="flex flex-col font-medium">
            Branch {isBranchRequired && '*'}
            <select 
              className="border rounded px-2 py-1 mt-1"
              value={formData.branchId || ''}
              onChange={(e) => handleInputChange('branchId', e.target.value ? Number(e.target.value) : undefined)}
              required={isBranchRequired}
            >
              <option value="">Select Branch</option>
              {branches
                .filter(branch => 
                  // For branch admins and encoders, only show their assigned branch
                  // For central admins and super admins, show all branches
                  (currentUser?.roleId === 3 || currentUser?.roleId === 4) ? branch.id === currentUser.branchId : true
                )
                .map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                ))}
            </select>
            {/* NEW: Help text for Central Admin */}
            {formData.roleId === 2 && (
              <span className="text-xs text-gray-600 mt-1">
                Central Admin can have no branch assignment (access to all branches)
              </span>
            )}
          </label>
          
          <label className="flex flex-col font-medium">
            Area {isAreaRequired && '*'}
            <select 
              className="border rounded px-2 py-1 mt-1"
              value={formData.areaId || ''}
              onChange={(e) => handleInputChange('areaId', e.target.value ? Number(e.target.value) : undefined)}
              required={isAreaRequired}
            >
              <option value="">Select Area</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.areaName}</option>
              ))}
            </select>
            {/* NEW: Help text for Central Admin */}
            {formData.roleId === 2 && (
              <span className="text-xs text-gray-600 mt-1">
                Central Admin can have no area assignment (access to all areas)
              </span>
            )}
          </label>
          
          <label className="flex flex-col font-medium">
            First Name *
            <input 
              type="text" 
              className="border rounded px-2 py-1 mt-1"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </label>
          
          <label className="flex flex-col font-medium">
            Last Name *
            <input 
              type="text" 
              className="border rounded px-2 py-1 mt-1"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </label>
          
          <label className="flex flex-col font-medium">
            Email *
            <input 
              type="email" 
              className="border rounded px-2 py-1 mt-1"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </label>
          
          <label className="flex flex-col font-medium">
            Username *
            <input 
              type="text" 
              className="border rounded px-2 py-1 mt-1"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              required
            />
          </label>
          
          <label className="flex flex-col font-medium">
            Password *
            <input 
              type="password" 
              className="border rounded px-2 py-1 mt-1"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </label>
        </form>
        
        <div className="flex w-full justify-center gap-6 mt-6">
          <button 
            type="button"
            className="bg-red-700 hover:bg-red-800 text-white font-semibold px-8 py-2 rounded-lg shadow transition"
            onClick={handleClear}
            disabled={loading}
          >
            Clear all
          </button>
          <button 
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg shadow transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal; 