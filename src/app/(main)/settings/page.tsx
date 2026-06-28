'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineCog, HiOutlineShieldCheck, HiOutlineBell, HiOutlineLogout, HiOutlineGlobe } from 'react-icons/hi';
import MainLayout from '@/components/layout/MainLayout';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { API_BASE } from '@/lib/config';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);

  // Site settings
  const [siteName, setSiteName] = useState('Z.XTREAM');
  const [siteDescription, setSiteDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#a78bfa');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [savingSite, setSavingSite] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);
      setDisplayName(userData.displayName || '');
      fetchProfile(userData.uid);
      fetchSiteSettings();
    } else {
      router.push('/login');
    }
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile/${uid}`);
      const data = await res.json();
      if (data.success) {
        setBio(data.data.bio || '');
        setCountry(data.data.country || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/site/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        setSiteName(data.data.siteName || 'Z.XTREAM');
        setSiteDescription(data.data.siteDescription || '');
        setPrimaryColor(data.data.primaryColor || '#a78bfa');
        setAccentColor(data.data.accentColor || '#ec4899');
      }
    } catch {}
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await fetch(`${API_BASE}/api/users/profile/${user.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, country }),
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleSaveSite = async () => {
    if (!user) return;
    setSavingSite(true);
    try {
      await fetch(`${API_BASE}/api/site/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterUid: user.uid,
          settings: { siteName, siteDescription, primaryColor, accentColor },
        }),
      });
    } catch {} finally {
      setSavingSite(false);
    }
  };

  const isOwner = user?.role === 'owner' || user?.isOwner;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'preferences', label: 'Preferences', icon: HiOutlineCog },
    { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
    ...(isOwner ? [{ id: 'site', label: 'Site Settings', icon: HiOutlineGlobe }] : []),
  ];

  return (
    <MainLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-48">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-accent-red hover:bg-accent-red/10 transition-all duration-200"
              >
                <HiOutlineLogout className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl"
              >
                <h2 className="text-lg font-bold mb-4">Profile Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="input resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input"
                    >
                      <option value="">Select country</option>
                      <option value="ID">Indonesia</option>
                      <option value="JP">Japan</option>
                      <option value="US">United States</option>
                      <option value="KR">South Korea</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl"
              >
                <h2 className="text-lg font-bold mb-4">Player Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Auto Play</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Auto Next Episode</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Skip Intro</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Skip Ending</span>
                    <input type="checkbox" className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600" />
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Default Quality</label>
                    <select className="input">
                      <option value="auto">Auto</option>
                      <option value="360p">360p</option>
                      <option value="480p">480p</option>
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl"
              >
                <h2 className="text-lg font-bold mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Change Password</h3>
                    <input type="password" placeholder="Current password" className="input mb-2" />
                    <input type="password" placeholder="New password" className="input mb-2" />
                    <input type="password" placeholder="Confirm new password" className="input mb-4" />
                    <button className="btn-primary">Update Password</button>
                  </div>
                  <div className="border-t border-dark-700 pt-4">
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-dark-400 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="btn-secondary">Enable 2FA</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'site' && isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl"
              >
                <h2 className="text-lg font-bold mb-4">Site Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1">Site Description</label>
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows={2}
                      className="input resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="input flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-1">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="input flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveSite}
                      disabled={savingSite}
                      className="btn-primary disabled:opacity-50"
                    >
                      {savingSite ? 'Saving...' : 'Save Site Settings'}
                    </button>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      <HiOutlineShieldCheck className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
