'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useSession } from 'next-auth/react';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  PaintBrushIcon,
  CloudArrowUpIcon,
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  LinkIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  department?: string;
  createdAt: string;
}

interface NotificationSettings {
  emailAlerts: boolean;
  matchUpdates: boolean;
  jobAlerts: boolean;
  placementUpdates: boolean;
  marketingEmails: boolean;
  browserNotifications: boolean;
  mobileNotifications: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  lastLogin: string;
  loginHistory: Array<{
    date: string;
    ip: string;
    device: string;
    location: string;
  }>;
  activeSessions: Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

interface APIConfig {
  apiKey: string;
  apiSecret: string;
  whitelistedIPs: string[];
  rateLimit: number;
  usageThisMonth: number;
  endpoints: Array<{
    path: string;
    method: string;
    calls: number;
    lastCalled: string;
  }>;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animations: boolean;
  sidebarCollapsed: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  config?: Record<string, any>;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    id: session?.user?.id || '',
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    role: session?.user?.role || 'institution',
    institution: '',
    avatar: '',
    bio: '',
    phone: '',
    department: '',
    createdAt: new Date().toISOString()
  });

  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    matchUpdates: true,
    jobAlerts: true,
    placementUpdates: true,
    marketingEmails: false,
    browserNotifications: true,
    mobileNotifications: false,
    digestFrequency: 'weekly'
  });

  // Security Settings
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: '2024-01-15',
    lastLogin: new Date().toISOString(),
    loginHistory: [
      {
        date: new Date().toISOString(),
        ip: '192.168.1.1',
        device: 'Chrome on Windows',
        location: 'New York, US'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        ip: '192.168.1.1',
        device: 'Firefox on Windows',
        location: 'New York, US'
      }
    ],
    activeSessions: [
      {
        id: '1',
        device: 'Windows PC',
        browser: 'Chrome 120.0',
        location: 'New York, US',
        lastActive: 'Just now',
        current: true
      }
    ]
  });

  // API Configuration
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    apiKey: 'sk_live_' + Math.random().toString(36).substring(2, 15),
    apiSecret: Math.random().toString(36).substring(2, 30),
    whitelistedIPs: ['192.168.1.1', '10.0.0.1'],
    rateLimit: 1000,
    usageThisMonth: 342,
    endpoints: [
      { path: '/api/students', method: 'GET', calls: 1250, lastCalled: '2 mins ago' },
      { path: '/api/jobs', method: 'GET', calls: 890, lastCalled: '5 mins ago' },
      { path: '/api/ai-match', method: 'POST', calls: 156, lastCalled: '1 hour ago' }
    ]
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'dark',
    primaryColor: '#3B82F6',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    sidebarCollapsed: false
  });

  // Integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import jobs and candidates from LinkedIn',
      icon: '🔗',
      connected: false
    },
    {
      id: 'indeed',
      name: 'Indeed',
      description: 'Sync job postings from Indeed',
      icon: '💼',
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in Slack',
      icon: '💬',
      connected: true,
      lastSync: '2 hours ago',
      config: { channel: '#placement-updates' }
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Schedule interviews automatically',
      icon: '📅',
      connected: false
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Create interview meetings',
      icon: '🎥',
      connected: true,
      lastSync: '1 day ago',
      config: { defaultDuration: 60 }
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync placement data with CRM',
      icon: '☁️',
      connected: false
    }
  ]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // New IP input
  const [newIP, setNewIP] = useState('');

useEffect(() => {
  if (session?.user?.id) {
    fetchUserSettings();
  }
}, [session]);

const fetchUserSettings = async () => {
  try {
    setLoading(true);
    const res = await fetch('/api/user/settings');
    const data = await res.json();
    
    if (data.success) {
      setProfile(data.profile);
      setNotifications(data.notifications);
      setSecurity(data.security);
      setApiConfig(data.api);
      setAppearance(data.appearance);
      setIntegrations(data.integrations);
    } else {
      toast.error(data.error || 'Failed to load settings');
    }
  } catch (error) {
    console.error('Fetch settings error:', error);
    toast.error('Error loading settings');
  } finally {
    setLoading(false);
  }
};

// Add a refresh button in the header
const handleRefresh = () => {
  fetchUserSettings();
  toast.success('Settings refreshed');
};

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Avatar updated successfully');
        setProfile({ ...profile, avatar: data.url });
        setAvatarPreview(null);
        setAvatarFile(null);
      } else {
        toast.error(data.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Profile updated successfully');
        await update(); // Update session
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ current: '', new: '', confirm: '' });
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate your current API key.')) return;

    try {
      const res = await fetch('/api/user/api-key', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setApiConfig({ ...apiConfig, apiKey: data.key, apiSecret: data.secret });
        toast.success('API key regenerated');
      }
    } catch (error) {
      toast.error('Failed to regenerate API key');
    }
  };

  const toggleTwoFactor = async () => {
    try {
      const res = await fetch('/api/user/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !security.twoFactorEnabled })
      });
      if (res.ok) {
        setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled });
        toast.success(`2FA ${!security.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error('Failed to toggle 2FA');
    }
  };

  const addWhitelistedIP = () => {
    if (newIP && !apiConfig.whitelistedIPs.includes(newIP)) {
      setApiConfig({
        ...apiConfig,
        whitelistedIPs: [...apiConfig.whitelistedIPs, newIP]
      });
      setNewIP('');
      toast.success('IP added to whitelist');
    }
  };

  const removeWhitelistedIP = (ip: string) => {
    setApiConfig({
      ...apiConfig,
      whitelistedIPs: apiConfig.whitelistedIPs.filter(i => i !== ip)
    });
    toast.success('IP removed');
  };

  const toggleIntegration = async (integrationId: string) => {
    setIntegrations(integrations.map(i => 
      i.id === integrationId ? { ...i, connected: !i.connected } : i
    ));
    toast.success(`Integration ${integrations.find(i => i.id === integrationId)?.connected ? 'disconnected' : 'connected'}`);
  };

  const saveAllSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          notifications,
          appearance
        })
      });
      if (res.ok) {
        toast.success('All settings saved');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'profile', name: 'Profile Settings', icon: UserCircleIcon, description: 'Manage your personal information' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Configure how you receive alerts' },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, description: 'Password, 2FA, and session management' },
    { id: 'api', name: 'API Configuration', icon: KeyIcon, description: 'Manage API keys and access' },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon, description: 'Customize the look and feel' },
    { id: 'integrations', name: 'Integrations', icon: CloudArrowUpIcon, description: 'Connect with third-party services' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Cog6ToothIcon className="h-6 w-6 mr-2 text-gray-400" />
                Settings
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage your account preferences and system configuration
              </p>
            </div>
            <button
              onClick={saveAllSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Save All Changes</span>
            </button>
            {/* In the header section, add this next to the Save button */}
            <button
              onClick={handleRefresh}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-start space-x-3 p-4 rounded-xl transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <section.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium">{section.name}</p>
                  <p className={`text-xs mt-1 ${
                    activeSection === section.id ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {section.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Profile Settings */}
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                          ) : profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                          ) : (
                            profile.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 h-8 w-8 bg-gray-800 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <CameraIcon className="h-4 w-4 text-gray-300" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                      {avatarFile && (
                        <div className="flex space-x-2">
                          <button
                            onClick={uploadAvatar}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Upload
                          </button>
                          <button
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Department</label>
                        <input
                          type="text"
                          value={profile.department || ''}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Institution</label>
                        <input
                          type="text"
                          value={profile.institution || ''}
                          onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Role</label>
                        <input
                          type="text"
                          value={profile.role}
                          disabled
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                )}

                {/* Notifications */}
                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <p className="text-white font-medium">Email Alerts</p>
                          <p className="text-sm text-gray-400">Receive important updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.emailAlerts}
                            onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <p className="text-white font-medium">Match Updates</p>
                          <p className="text-sm text-gray-400">Get notified when new matches are found</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.matchUpdates}
                            onChange={(e) => setNotifications({ ...notifications, matchUpdates: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <p className="text-white font-medium">Job Alerts</p>
                          <p className="text-sm text-gray-400">New job postings matching your criteria</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.jobAlerts}
                            onChange={(e) => setNotifications({ ...notifications, jobAlerts: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <p className="text-white font-medium">Placement Updates</p>
                          <p className="text-sm text-gray-400">Track student placement progress</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.placementUpdates}
                            onChange={(e) => setNotifications({ ...notifications, placementUpdates: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <p className="text-white font-medium">Browser Notifications</p>
                          <p className="text-sm text-gray-400">Show desktop notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.browserNotifications}
                            onChange={(e) => setNotifications({ ...notifications, browserNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Digest Frequency</label>
                        <select
                          value={notifications.digestFrequency}
                          onChange={(e) => setNotifications({ ...notifications, digestFrequency: e.target.value as any })}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                          <option value="monthly">Monthly Digest</option>
                          <option value="never">No Digest</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security */}
                {activeSection === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Security Settings</h2>
                    
                    {/* Change Password */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-gray-300">Change Password</h3>
                      <div className="space-y-3">
                        <div className="relative">
                          <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Current Password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <input
                          type="password"
                          placeholder="New Password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={changePassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="pt-4 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <button
                          onClick={toggleTwoFactor}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            security.twoFactorEnabled
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-800 hover:bg-gray-700'
                          } text-white`}
                        >
                          {security.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="pt-4 border-t border-gray-800">
                      <h3 className="text-white font-medium mb-3">Active Sessions</h3>
                      <div className="space-y-3">
                        {security.activeSessions.map((session) => (
                          <div key={session.id} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white text-sm">
                                  {session.device} - {session.browser}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{session.location}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-400">{session.lastActive}</span>
                                {session.current && (
                                  <span className="ml-2 text-xs text-green-400">Current</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* API Configuration */}
                {activeSection === 'api' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">API Configuration</h2>
                    
                    {/* API Keys */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">API Key</label>
                        <div className="flex space-x-2">
                          <div className="flex-1 relative">
                            <input
                              type={showApiKey ? 'text' : 'password'}
                              value={apiConfig.apiKey}
                              readOnly
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
                            />
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showApiKey ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                              ) : (
                                <EyeIcon className="h-5 w-5 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(apiConfig.apiKey);
                              toast.success('API key copied');
                            }}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">API Secret</label>
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            value={apiConfig.apiSecret}
                            readOnly
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(apiConfig.apiSecret);
                              toast.success('API secret copied');
                            }}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={regenerateApiKey}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        Regenerate API Key
                      </button>
                    </div>

                    {/* IP Whitelist */}
                    <div className="pt-4 border-t border-gray-800">
                      <h3 className="text-white font-medium mb-3">IP Whitelist</h3>
                      <div className="space-y-2">
                        {apiConfig.whitelistedIPs.map((ip) => (
                          <div key={ip} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2">
                            <span className="text-white text-sm">{ip}</span>
                            <button
                              onClick={() => removeWhitelistedIP(ip)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <input
                          type="text"
                          value={newIP}
                          onChange={(e) => setNewIP(e.target.value)}
                          placeholder="Enter IP address"
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                        />
                        <button
                          onClick={addWhitelistedIP}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Usage Statistics */}
                    <div className="pt-4 border-t border-gray-800">
                      <h3 className="text-white font-medium mb-3">Usage Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400">Rate Limit</p>
                          <p className="text-2xl font-bold text-white">{apiConfig.rateLimit}/min</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <p className="text-sm text-gray-400">This Month</p>
                          <p className="text-2xl font-bold text-white">{apiConfig.usageThisMonth}</p>
                        </div>
                      </div>

                      <h4 className="text-sm font-medium text-gray-400 mb-2">Endpoint Usage</h4>
                      <div className="space-y-2">
                        {apiConfig.endpoints.map((endpoint) => (
                          <div key={endpoint.path} className="flex justify-between text-sm bg-gray-800/30 rounded-lg p-2">
                            <div>
                              <span className="text-blue-400">{endpoint.method}</span>
                              <span className="text-gray-300 ml-2">{endpoint.path}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-white">{endpoint.calls} calls</span>
                              <span className="text-gray-500 text-xs ml-2">{endpoint.lastCalled}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Appearance Settings</h2>
                    
                    {/* Theme */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'light', icon: SunIcon, label: 'Light' },
                          { id: 'dark', icon: MoonIcon, label: 'Dark' },
                          { id: 'system', icon: ComputerDesktopIcon, label: 'System' }
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setAppearance({ ...appearance, theme: theme.id as any })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              appearance.theme === theme.id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <theme.icon className={`h-6 w-6 mx-auto mb-2 ${
                              appearance.theme === theme.id ? 'text-blue-400' : 'text-gray-400'
                            }`} />
                            <span className={`text-sm ${
                              appearance.theme === theme.id ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                              {theme.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Color */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={appearance.primaryColor}
                          onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                          className="h-10 w-10 rounded border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={appearance.primaryColor}
                          onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Font Size</label>
                      <select
                        value={appearance.fontSize}
                        onChange={(e) => setAppearance({ ...appearance, fontSize: e.target.value as any })}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Compact Mode</p>
                          <p className="text-sm text-gray-400">Reduce spacing for more content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appearance.compactMode}
                            onChange={(e) => setAppearance({ ...appearance, compactMode: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Animations</p>
                          <p className="text-sm text-gray-400">Enable smooth transitions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appearance.animations}
                            onChange={(e) => setAppearance({ ...appearance, animations: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations */}
                {activeSection === 'integrations' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-white">Integrations</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {integrations.map((integration) => (
                        <div
                          key={integration.id}
                          className="bg-gray-800/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <h3 className="text-white font-medium">{integration.name}</h3>
                                <p className="text-xs text-gray-400">{integration.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleIntegration(integration.id)}
                              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                integration.connected
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gray-700 hover:bg-gray-600 text-white'
                              }`}
                            >
                              {integration.connected ? 'Connected' : 'Connect'}
                            </button>
                          </div>
                          
                          {integration.connected && integration.lastSync && (
                            <div className="flex items-center text-xs text-gray-500">
                              <ArrowPathIcon className="h-3 w-3 mr-1" />
                              Last sync: {integration.lastSync}
                            </div>
                          )}

                          {integration.config && (
                            <div className="mt-2 text-xs text-gray-400">
                              <pre className="bg-gray-900/50 p-2 rounded">
                                {JSON.stringify(integration.config, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}