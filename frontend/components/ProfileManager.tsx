'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ProfileManager() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: (user as any).phone || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.updateProfile(formData);
            setUser(res.data.data);
            toast.success('Profile updated successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Info */}
            <div className="card">
                <h2 className="section-title mb-6 flex items-center gap-2">
                    <span>📝</span> General Information
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="label">Full Name</label>
                        <input 
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Email Address</label>
                        <input 
                            className="input"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Phone Number</label>
                        <input 
                            className="input"
                            placeholder="e.g. 628123456789"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                            Include country code without + (e.g. 62812...)
                        </p>
                    </div>
                    <button className="btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>

            {/* Password */}
            <div className="card">
                <h2 className="section-title mb-6 flex items-center gap-2">
                    <span>🔒</span> Security
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="label">Current Password</label>
                        <input 
                            className="input"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">New Password</label>
                        <input 
                            className="input"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Confirm New Password</label>
                        <input 
                            className="input"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                        />
                    </div>
                    <button className="btn-secondary w-full" type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
