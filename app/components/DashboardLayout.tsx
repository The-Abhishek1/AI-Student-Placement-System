'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
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
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, href: '/' },
  { name: 'Students', icon: UsersIcon, href: '/students' },
  { name: 'Jobs', icon: BriefcaseIcon, href: '/jobs' },
  { name: 'Analytics', icon: ChartBarIcon, href: '/analytics' },
  { name: 'AI Matching', icon: RocketLaunchIcon, href: '/ai-matching' },
  { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && session?.user?.id) {
      fetchNotifications();
    }
  }, [mounted, session]);

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

  const handleLogout = async () => {
    await signOut({ redirectTo: '/login' });
  };

  // Don't render until after mounting to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
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
            <div className="fixed inset-0 bg-gray-900/80" />
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
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-white">EduPlace AI</h1>
                    <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded-full">PRO</span>
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
                                  className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                    isActive
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  }`}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-white">EduPlace AI</h1>
            <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded-full">PRO</span>
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
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
                aria-hidden="true"
              />
              <input
                className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                placeholder="Search students, jobs, skills..."
                type="search"
              />
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-300 relative">
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-gray-700 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 text-sm">
                          No notifications
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((notification: any) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <div
                                className={`w-full text-left px-4 py-3 ${
                                  active ? 'bg-gray-700' : ''
                                }`}
                              >
                                <p className="text-sm font-medium text-white">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                              </div>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {session?.user?.name?.charAt(0) || 'A'}
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-white">
                      {session?.user?.name || 'Admin User'}
                    </span>
                  </span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-gray-800 py-2 shadow-lg ring-1 ring-gray-700 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings"
                          className={`${
                            active ? 'bg-gray-700' : ''
                          } block px-4 py-2 text-sm text-white`}
                        >
                          Profile Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-700' : ''
                          } block w-full text-left px-4 py-2 text-sm text-red-400`}
                        >
                          <div className="flex items-center">
                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                            Logout
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}