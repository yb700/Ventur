/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(portal)/settings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
    User,
    Lock,
    Save,
    Loader2,
    AlertTriangle,
    Image as ImageIcon,
    Sun,
    Moon,
    Monitor,
    Palette,
    Shield,
    Key,
    Bell,
    Globe,
    Smartphone,
    Mail,
    Building2,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { Database } from '@/types/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

type UserProfile = Database['public']['Tables']['profiles']['Row'];

/**
 * Modern settings page for Lorem users.
 * Provides comprehensive account management and preferences.
 */
export default function SettingsPage() {
    const { theme, setTheme, isDarkMode, cycleTheme } = useTheme();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    // Security settings
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);

    const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess("Your password has been updated successfully.");
                setPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load user profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (!error && data) {
                        setProfile(data);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };
        loadProfile();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setProfileLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !profile) {
                setError('User not found');
                return;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    company_name: profile.company_name,
                    address: profile.address,
                    email: profile.email,
                    logo_url: profile.logo_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess('Profile updated successfully.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            setError('File is too large. Max 2MB.');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('User not authenticated');
                return;
            }

            setIsUploadingLogo(true);
            const filePath = `logos/${user.id}/${Date.now()}_${file.name}`;

            const { error } = await supabase.storage.from('logo').upload(filePath, file);
            if (error) {
                throw error;
            }

            const { data } = supabase.storage.from('logo').getPublicUrl(filePath);
            setProfile(prev => prev ? { ...prev, logo_url: data.publicUrl } : null);
            setSuccess('Logo uploaded successfully!');
        } catch (error: any) {
            setError(`Upload failed: ${error.message}`);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                    <p className="text-base-content/70">
                        Manage your account security, profile, and preferences
                    </p>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="alert alert-error">
                    <XCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={clearMessages} className="btn btn-sm btn-ghost">×</button>
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    <CheckCircle className="w-5 h-5" />
                    <span>{success}</span>
                    <button onClick={clearMessages} className="btn btn-sm btn-ghost">×</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Navigation */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body p-4">
                            <h3 className="font-semibold mb-4">Settings</h3>
                            <ul className="menu menu-compact">
                                <li>
                                    <a href="#profile" className="flex items-center gap-3">
                                        <User className="w-4 h-4" />
                                        <span>Profile</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#security" className="flex items-center gap-3">
                                        <Shield className="w-4 h-4" />
                                        <span>Security</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#appearance" className="flex items-center gap-3">
                                        <Palette className="w-4 h-4" />
                                        <span>Appearance</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#notifications" className="flex items-center gap-3">
                                        <Bell className="w-4 h-4" />
                                        <span>Notifications</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Column - Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Settings */}
                    <div id="profile" className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="card-title text-xl">Profile Information</h2>
                                    <p className="text-sm text-base-content/60">Update your personal and company details</p>
                                </div>
                            </div>

                            {profile && (
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-medium">Full Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Your full name"
                                                className="input input-bordered"
                                                value={profile.full_name || ''}
                                                onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-medium">Company Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Your company name"
                                                className="input input-bordered"
                                                value={profile.company_name || ''}
                                                onChange={(e) => setProfile(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-medium">Email Address</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                className="input input-bordered"
                                                value={profile.email || ''}
                                                onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                                            />
                                        </div>



                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text font-medium">Business Address</span>
                                            </label>
                                            <textarea
                                                placeholder="Your business address"
                                                className="textarea textarea-bordered h-20"
                                                value={profile.address || ''}
                                                onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                                            />
                                        </div>

                                        <div className="form-control md:col-span-2">
                                            <label className="label">
                                                <span className="label-text font-medium">Company Logo</span>
                                            </label>
                                            <div className="flex items-center gap-4">
                                                {profile.logo_url && (
                                                    <Image
                                                        src={profile.logo_url}
                                                        alt="Company logo"
                                                        width={64}
                                                        height={64}
                                                        className="w-16 h-16 object-contain border rounded-lg"
                                                    />
                                                )}
                                                <label className="btn btn-outline">
                                                    <ImageIcon className="w-4 h-4 mr-2" />
                                                    {profile.logo_url ? 'Change Logo' : 'Upload Logo'}
                                                    <input
                                                        type="file"
                                                        hidden
                                                        accept="image/png, image/jpeg"
                                                        onChange={handleLogoUpload}
                                                        disabled={isUploadingLogo}
                                                    />
                                                    {isUploadingLogo && <span className="loading loading-spinner loading-xs ml-2"></span>}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-end">
                                        <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                                            {profileLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Update Profile
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div id="security" className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-error" />
                                </div>
                                <div>
                                    <h2 className="card-title text-xl">Security Settings</h2>
                                    <p className="text-sm text-base-content/60">Manage your account security and authentication</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input input-bordered"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Confirm New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input input-bordered"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="card-actions justify-end">
                                    <button type="submit" className="btn btn-error" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Key className="w-4 h-4 mr-2" />
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Additional Security Options */}
                            <div className="divider">Additional Security</div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Key className="w-5 h-5 text-warning" />
                                        <div>
                                            <h4 className="font-medium">Two-Factor Authentication</h4>
                                            <p className="text-sm text-base-content/60">Add an extra layer of security to your account</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-warning"
                                        checked={twoFactorEnabled}
                                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-info" />
                                        <div>
                                            <h4 className="font-medium">Session Timeout</h4>
                                            <p className="text-sm text-base-content/60">Automatically log out after inactivity</p>
                                        </div>
                                    </div>
                                    <select
                                        className="select select-bordered select-sm"
                                        value={sessionTimeout}
                                        onChange={(e) => setSessionTimeout(Number(e.target.value))}
                                    >
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={120}>2 hours</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div id="appearance" className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <h2 className="card-title text-xl">Appearance</h2>
                                    <p className="text-sm text-base-content/60">Customize your interface appearance</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Theme Selection */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Theme Style</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <label className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-base-300'}`}>
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="light"
                                                checked={theme === 'light'}
                                                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'corporate')}
                                                className="sr-only"
                                            />
                                            <Sun className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium">Light</span>
                                            {theme === 'light' && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                                        </label>

                                        <label className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-base-300'}`}>
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="dark"
                                                checked={theme === 'dark'}
                                                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'corporate')}
                                                className="sr-only"
                                            />
                                            <Moon className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium">Dark</span>
                                            {theme === 'dark' && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                                        </label>

                                        <label className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${theme === 'corporate' ? 'border-primary bg-primary/10' : 'border-base-300'}`}>
                                            <input
                                                type="radio"
                                                name="theme"
                                                value="corporate"
                                                checked={theme === 'corporate'}
                                                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'corporate')}
                                                className="sr-only"
                                            />
                                            <Building2 className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium">Corporate</span>
                                            {theme === 'corporate' && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                                        </label>
                                    </div>
                                    <div className="label">
                                        <span className="label-text-alt text-base-content/70">
                                            Choose your preferred theme style. Corporate theme has a professional business appearance.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div id="notifications" className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h2 className="card-title text-xl">Notifications</h2>
                                    <p className="text-sm text-base-content/60">Manage how you receive notifications</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <div>
                                            <h4 className="font-medium">Email Notifications</h4>
                                            <p className="text-sm text-base-content/60">Receive notifications via email</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-secondary" />
                                        <div>
                                            <h4 className="font-medium">SMS Notifications</h4>
                                            <p className="text-sm text-base-content/60">Receive notifications via SMS</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-secondary"
                                        checked={smsNotifications}
                                        onChange={(e) => setSmsNotifications(e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
