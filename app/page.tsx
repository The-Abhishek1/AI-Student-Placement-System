'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchStats();
    }
  }, [mounted]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const defaultStats = stats || {
    totalStudents: 0,
    studentsTrend: '0%',
    activeJobs: 0,
    jobsTrend: '0%',
    successfulPlacements: 0,
    placementsTrend: '0%',
    totalCompanies: 0,
    companiesTrend: '0',
    recentMatches: []
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your placement intelligence system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {defaultStats.totalStudents}
                </p>
                <span className="text-xs text-green-400 mt-2 block">
                  ↑ {defaultStats.studentsTrend} this month
                </span>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {defaultStats.activeJobs}
                </p>
                <span className="text-xs text-green-400 mt-2 block">
                  ↑ {defaultStats.jobsTrend} from yesterday
                </span>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Successful Placements</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {defaultStats.successfulPlacements}
                </p>
                <span className="text-xs text-yellow-400 mt-2 block">
                  ↑ {defaultStats.placementsTrend} this quarter
                </span>
              </div>
              <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Partner Companies</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {defaultStats.totalCompanies}
                </p>
                <span className="text-xs text-purple-400 mt-2 block">
                  +{defaultStats.companiesTrend} new this month
                </span>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent AI Matches */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <RocketLaunchIcon className="h-5 w-5 mr-2 text-purple-400" />
              Recent AI Matches
            </h2>
            <Link 
              href="/ai-matching"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
            >
              View All 
              <span className="ml-1">→</span>
            </Link>
          </div>

          {defaultStats.recentMatches?.length > 0 ? (
            <div className="space-y-4">
              {defaultStats.recentMatches.map((match: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {match.student?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{match.student || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">
                        {match.role || 'Position'} at {match.company || 'Company'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      match.score > 90 ? 'text-green-400' :
                      match.score > 80 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {match.score || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <RocketLaunchIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No matches yet. Run AI analysis to see matches.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/ai-matching">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer">
              <RocketLaunchIcon className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Run AI Analysis</h3>
              <p className="text-sm text-gray-400">Match all students with latest jobs</p>
            </div>
          </Link>

          <Link href="/jobs">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer">
              <BriefcaseIcon className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Import Jobs</h3>
              <p className="text-sm text-gray-400">Fetch latest jobs from portals</p>
            </div>
          </Link>

          <Link href="/analytics">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer">
              <ChartBarIcon className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">View Reports</h3>
              <p className="text-sm text-gray-400">Check placement analytics</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}