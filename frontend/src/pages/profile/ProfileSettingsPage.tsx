import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User as UserIcon, Camera, KeyRound, Save } from 'lucide-react';
import { authService } from '../../services/authService';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      addToast('Name and email cannot be blank', 'error');
      return;
    }
    setLoading(true);
    try {
      await authService.updateProfile({
        full_name: fullName,
        email,
        ...(password ? { password } : {})
      });
      addToast('Profile successfully updated!', 'success');
      setPassword('');
      await refreshUser();
    } catch (err) {
      addToast('Failed to update details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      await authService.uploadAvatar(file);
      addToast('Avatar uploaded successfully!', 'success');
      await refreshUser();
    } catch (err) {
      addToast('Failed to upload avatar image', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="w-8 h-8 text-primary-600" /> Profile Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure your password, address, and profile settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar Upload */}
        <Card className="text-center space-y-4 flex flex-col items-center justify-center">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-primary-500 overflow-hidden flex items-center justify-center font-black text-2xl text-slate-600 dark:text-slate-200">
              {user?.images && user.images.length > 0 ? (
                <img src={user.images[user.images.length - 1].url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.full_name[0].toUpperCase()
              )}
            </div>
            <label className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity cursor-pointer text-white">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={avatarLoading}
              />
            </label>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{user?.full_name}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
          </div>
        </Card>

        {/* Details Form */}
        <div className="md:col-span-2">
          <Card className="space-y-6">
            <h2 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary-600" /> Account Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
              <Input
                label="Change Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />

              <div className="pt-2">
                <Button type="submit" className="w-full gap-2" isLoading={loading}>
                  <Save className="w-4 h-4" /> Save Profile Details
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default ProfileSettingsPage;
