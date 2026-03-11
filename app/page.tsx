'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  RocketLaunchIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 1247,
    activeJobs: 3892,
    placements: 856,
    companies: 156
  });

  const [recentMatches, setRecentMatches] = useState([
    { student: 'Sarah Chen', role: 'Software Engineer', company: 'Google', score: 98 },
    { student: 'Alex Kumar', role: 'Data Scientist', company: 'Microsoft', score: 94 },
    { student: 'Maria Garcia', role: 'Security Analyst', company: 'AWS', score: 82 },
    { student: 'James Wilson', role: 'Product Manager', company: 'Meta', score: 88 },
  ]);

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      
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
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalStudents}</p>
                <span className="text-xs text-green-400 mt-2 block">↑ 12% this month</span>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.activeJobs}</p>
                <span className="text-xs text-green-400 mt-2 block">↑ 8% from yesterday</span>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Successful Placements</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.placements}</p>
                <span className="text-xs text-yellow-400 mt-2 block">↑ 23% this quarter</span>
              </div>
              <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Partner Companies</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.companies}</p>
                <span className="text-xs text-purple-400 mt-2 block">+15 new this month</span>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent AI Matches */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <RocketLaunchIcon className="h-5 w-5 mr-2 text-purple-400" />
              Recent AI Matches
            </h2>
            <button className="text-sm text-purple-400 hover:text-purple-300">
              View All →
            </button>
          </div>

          <div className="space-y-4">
            {recentMatches.map((match, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {match.student.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{match.student}</p>
                    <p className="text-sm text-gray-400">{match.role} at {match.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    match.score > 90 ? 'text-green-400' :
                    match.score > 80 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {match.score}%
                  </span>
                  <p className="text-xs text-gray-500">Match Score</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all text-left">
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Run AI Analysis</h3>
            <p className="text-sm text-gray-400">Match all students with latest jobs</p>
          </button>

          <button className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all text-left">
            <BriefcaseIcon className="h-8 w-8 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Import Jobs</h3>
            <p className="text-sm text-gray-400">Fetch latest jobs from portals</p>
          </button>

          <button className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all text-left">
            <ChartBarIcon className="h-8 w-8 text-purple-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">View Reports</h3>
            <p className="text-sm text-gray-400">Check placement analytics</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}