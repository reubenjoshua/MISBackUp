import React, { useState, useEffect } from "react";
import { useUserStore } from "@/zustand/userStore";
import { userService } from "@/services/userService";

interface Area {
  id: number;
  areaName: string;
}

interface Branch {
  id: number;
  branchName: string;
}

export default function ManageProfile() {
  const currentUser = useUserStore((state) => state.user);
  const [areas, setAreas] = useState<Area[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    role: "",
    email: "",
    area: "",
    branch: "",
    username: "",
    firstName: "",
    lastName: ""
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: ""
  });

  // Load user data and dropdowns on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load user profile
        const userProfile = await userService.getProfile();
        setProfileForm({
          role: userProfile.roleName || "",
          email: userProfile.email || "",
          area: userProfile.areaName || "",
          branch: userProfile.branchName || "",
          username: userProfile.userName || "",
          firstName: userProfile.firstName || "",
          lastName: userProfile.lastName || ""
        });

        // Load areas and branches for dropdowns
        const [areasData, branchesData] = await Promise.all([
          userService.getAreas(),
          userService.getBranches()
        ]);
        
        setAreas(areasData);
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading profile data:', error);
        alert('Failed to load profile data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        roleName: profileForm.role,
        username: profileForm.username,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName
      });
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    try {
      if (passwordForm.password !== passwordForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      if (passwordForm.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      
      setSaving(true);
      await userService.changePassword({
        password: passwordForm.password,
        confirmPassword: passwordForm.confirmPassword
      });
      
      alert('Password changed successfully!');
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={profileForm.role}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter role"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Area</label>
                <select
                  name="area"
                  value={profileForm.area}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                >
                  <option value={profileForm.area}>{profileForm.area || 'No area assigned'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Branch</label>
                <select
                  name="branch"
                  value={profileForm.branch}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                >
                  <option value={profileForm.branch}>{profileForm.branch || 'No branch assigned'}</option>
                </select>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md transition duration-200"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Change Password Section */}
        <div>
          <h2 className="text-2xl font-semibold text-center mb-6">Change Password</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={passwordForm.password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div className="flex justify-center mt-6 mb-6">
            <button
              onClick={handlePasswordSave}
              disabled={saving}
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md transition duration-200"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}