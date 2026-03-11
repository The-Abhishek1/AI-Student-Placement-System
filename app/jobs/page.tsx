'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: string;
  postedDate: string;
  skills: string[];
  description: string;
  source: string;
  matchCount?: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await fetch(`/api/jobs?keywords=software,data,ai&location=remote`);
      const data = await res.json();
      setJobs(data.jobs || []);
      
      if (refresh) toast.success('Jobs refreshed successfully');
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const jobTypes = [...new Set(jobs.map(j => j.type))];

  return (
    <DashboardLayout activeTab="jobs">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Job Listings</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time jobs from multiple sources</p>
            </div>
            <button
              onClick={() => fetchJobs(true)}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Jobs'}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <FunnelIcon className="h-5 w-5" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Jobs</p>
            <p className="text-3xl font-bold text-white mt-2">{jobs.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Remote Jobs</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {jobs.filter(j => j.location.toLowerCase().includes('remote')).length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">New Today</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">23</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg. Salary</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">$95k</p>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <p className="text-gray-400 flex items-center mt-1">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        {job.company}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <BookmarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    {job.salary.min}k - {job.salary.max}k
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    {job.type}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-300 line-clamp-2">{job.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 5).map(skill => (
                    <span key={skill} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">Source: {job.source}</span>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                    {job.matchCount && (
                      <span className="bg-green-900/50 text-green-400 px-3 py-2 rounded-lg text-sm">
                        {job.matchCount} matches
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No jobs found matching your criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}