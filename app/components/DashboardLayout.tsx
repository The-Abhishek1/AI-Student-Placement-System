'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  RocketLaunchIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  XMarkIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, href: '/', color: 'from-blue-500 to-blue-600' },
  { name: 'Students', icon: UsersIcon, href: '/students', color: 'from-green-500 to-green-600' },
  { name: 'Jobs', icon: BriefcaseIcon, href: '/jobs', color: 'from-purple-500 to-purple-600' },
  { name: 'Analytics', icon: ChartBarIcon, href: '/analytics', color: 'from-yellow-500 to-yellow-600' },
  { name: 'AI Matching', icon: RocketLaunchIcon, href: '/ai-matching', color: 'from-pink-500 to-pink-600' },
  { name: 'Settings', icon: Cog6ToothIcon, href: '/settings', color: 'from-gray-500 to-gray-600' },
];

const quickActions = [
  { name: 'Add Student', icon: UsersIcon, href: '/students?action=add', color: 'green' },
  { name: 'Post Job', icon: BriefcaseIcon, href: '/jobs?action=add', color: 'blue' },
  { name: 'Run AI Match', icon: RocketLaunchIcon, href: '/ai-matching', color: 'purple' },
  { name: 'View Reports', icon: ChartBarIcon, href: '/analytics', color: 'yellow' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force avatar refresh
  
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  // Add avatar refresh trigger
const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());


 // Listen for avatar updates from settings page
useEffect(() => {
  const handleAvatarUpdate = (event: CustomEvent) => {
    console.log('Avatar updated, refreshing header...');
    setAvatarTimestamp(Date.now());
    // Force session update
    update();
  };

  window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);
  
  return () => {
    window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
  };
}, [update]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && session?.user?.id) {
      fetchNotifications();
      // Load sidebar state from localStorage
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setSidebarCollapsed(JSON.parse(saved));
      }
    }
  }, [mounted, session]);

  // Update avatar when session changes
  useEffect(() => {
    if (session?.user?.avatar) {
      setAvatarKey(Date.now());
    }
  }, [session?.user?.avatar]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev =>
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = async () => {
    await signOut({ redirectTo: '/login' });
  };

  // Don't render until after mounting to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Get user avatar with cache busting
  const userAvatar = session?.user?.avatar || session?.user?.image || null;
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 'A';
  const avatarUrl = userAvatar ? `${userAvatar}?v=${avatarKey}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/95 backdrop-blur-xl px-6 pb-4 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      EduPlace AI
                    </h1>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Mobile user info */}
                  <div className="flex items-center gap-x-4 py-3 px-2 rounded-xl bg-gray-800/50">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                      {avatarUrl ? (
                        <img 
                          key={avatarUrl}
                          src={avatarUrl} 
                          alt={session?.user?.name || ''} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error('Avatar load error');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-400 truncate">{session?.user?.email || 'admin@eduplace.ai'}</p>
                    </div>
                  </div>

                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={`group relative flex items-center gap-x-3 rounded-xl p-2 text-sm leading-6 font-semibold transition-all ${
                                    isActive
                                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                  }`}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" />
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>

                  {/* Mobile quick actions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 px-2">QUICK ACTIONS</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <Link
                          key={action.name}
                          href={action.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className={`p-1.5 rounded-lg bg-${action.color}-500/20 group-hover:bg-${action.color}-500/30 transition-colors`}>
                            <action.icon className={`h-4 w-4 text-${action.color}-400`} />
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">
                            {action.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

    {/* Desktop sidebar */}
<motion.div
  initial={false}
  animate={{ width: sidebarCollapsed ? '5rem' : '18rem' }}
  transition={{ duration: 0.2, ease: 'easeInOut' }}
  className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col"
>
  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/50 backdrop-blur-xl px-3 pb-4 border-r border-gray-800/50">
    {/* Header with logo and toggle */}
    <div className="flex h-16 shrink-0 items-center justify-between px-2">
      <motion.div
        animate={{ 
          opacity: sidebarCollapsed ? 0 : 1,
          x: sidebarCollapsed ? -20 : 0
        }}
        className="overflow-hidden whitespace-nowrap"
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          EduPlace AI
        </h1>
      </motion.div>
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white flex-shrink-0"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRightIcon className="h-5 w-5" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5" />
        )}
      </button>
    </div>

    {/* User info in sidebar - hidden when collapsed */}
    <AnimatePresence>
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-x-3 px-2 py-3 rounded-xl bg-gray-800/30 border border-gray-800/50 overflow-hidden mx-1"
        >
{/* User info in sidebar - update the avatar section */}
<div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
  {avatarUrl ? (
    <img 
      key={avatarUrl}
      src={avatarUrl} 
      alt={session?.user?.name || ''} 
      className="h-full w-full object-cover"
      onError={(e) => {
        console.error('Avatar load error');
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = userInitial;
          parent.classList.add('flex', 'items-center', 'justify-center');
        }
      }}
    />
  ) : (
    userInitial
  )}
</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email || 'admin@eduplace.ai'}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Navigation */}
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`group relative flex items-center gap-x-3 rounded-xl p-2 text-sm leading-6 font-semibold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                } ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className="h-6 w-6 shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r opacity-20"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>

    {/* Quick actions - hidden when collapsed */}
    <AnimatePresence>
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 mt-auto pt-4"
        >
          <p className="text-xs font-semibold text-gray-400 px-2">QUICK ACTIONS</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                <div className={`p-1.5 rounded-lg bg-${action.color}-500/20 group-hover:bg-${action.color}-500/30 transition-colors`}>
                  <action.icon className={`h-4 w-4 text-${action.color}-400`} />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">
                  {action.name}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</motion.div>

      {/* Main content */}
      <div className={`transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <div className="relative flex flex-1 items-center">
              <div className="relative w-full max-w-lg">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="h-10 w-full rounded-xl border-0 bg-gray-800/50 pl-10 pr-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  placeholder="Search students, jobs, skills..."
                />
                
                {/* Search results dropdown */}
                <AnimatePresence>
                  {showSearch && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full rounded-xl bg-gray-900 border border-gray-800 shadow-xl overflow-hidden z-50"
                    >
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors flex items-center gap-3"
                          onClick={() => {
                            router.push(result.url);
                            setShowSearch(false);
                            setSearchQuery('');
                          }}
                        >
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-white text-sm">{result.title}</p>
                            <p className="text-xs text-gray-400">{result.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Quick actions dropdown */}
              <Menu as="div" className="relative hidden md:block">
                <Menu.Button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <SparklesIcon className="h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-gray-900 py-2 shadow-lg ring-1 ring-gray-800 focus:outline-none">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400">
                      Quick Actions
                    </div>
                    {quickActions.map((action) => (
                      <Menu.Item key={action.name}>
                        {({ active }) => (
                          <Link
                            href={action.href}
                            className={`${
                              active ? 'bg-gray-800 text-white' : 'text-gray-300'
                            } group flex items-center gap-3 px-4 py-2 text-sm transition-colors`}
                          >
                            <action.icon className={`h-5 w-5 text-${action.color}-400`} />
                            {action.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Notifications */}
              <Menu as="div" className="relative">
                <Menu.Button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-gray-900 py-2 shadow-lg ring-1 ring-gray-800 focus:outline-none">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 text-sm">
                          No notifications
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <button
                                onClick={() => !notification.read && markAsRead(notification.id)}
                                className={`w-full text-left px-4 py-3 transition-colors ${
                                  active ? 'bg-gray-800' : ''
                                } ${!notification.read ? 'bg-gray-800/30' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-white">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </button>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 5 && (
                      <div className="border-t border-gray-800 px-4 py-2">
                        <Link
                          href="/notifications"
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>

{/* Profile dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-800 transition-all group">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all">
                  {avatarUrl ? (
                    <img 
                      key={avatarUrl}
                      src={avatarUrl} 
                      alt={session?.user?.name || ''}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error('Avatar load error in header');
                        e.currentTarget.style.display = 'none';
                        // Fallback to initials
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = userInitial;
                          parent.classList.add('flex', 'items-center', 'justify-center');
                        }
                      }}
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full">
                      {userInitial}
                    </span>
                  )}
                </div>
                <span className="hidden lg:flex lg:items-center">
                  <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {session?.user?.name || 'Admin User'}
                  </span>
                </span>
              </Menu.Button>
              {/* Rest of the menu remains the same */}

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-gray-900 py-2 shadow-lg ring-1 ring-gray-800 focus:outline-none">
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-medium text-white">{session?.user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-400 mt-1">{session?.user?.email || 'admin@eduplace.ai'}</p>
                    </div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings?tab=profile"
                          className={`${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          } group flex items-center gap-3 px-4 py-2 text-sm transition-colors`}
                        >
                          <UserCircleIcon className="h-5 w-5 text-gray-400" />
                          Profile Settings
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings?tab=security"
                          className={`${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          } group flex items-center gap-3 px-4 py-2 text-sm transition-colors`}
                        >
                          <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                          Security
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings?tab=notifications"
                          className={`${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          } group flex items-center gap-3 px-4 py-2 text-sm transition-colors`}
                        >
                          <BellIcon className="h-5 w-5 text-gray-400" />
                          Notifications
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings?tab=appearance"
                          className={`${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          } group flex items-center gap-3 px-4 py-2 text-sm transition-colors`}
                        >
                          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
                          Appearance
                        </Link>
                      )}
                    </Menu.Item>

                    <div className="border-t border-gray-800 my-2"></div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/help"
                          className={`${
                            active ? 'bg-gray-800 text-white' : 'text-gray-300'
                          } group flex items-center gap-3 px-4 py-2 text-sm transition-colors`}
                        >
                          <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400" />
                          Help & Support
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-800' : ''
                          } group flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}