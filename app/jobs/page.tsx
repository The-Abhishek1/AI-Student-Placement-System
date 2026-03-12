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
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AddJobModal from '../components/AddJobModal';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  type: 'fulltime' | 'parttime' | 'internship' | 'contract';
  postedDate: string;
  deadline?: string;
  source: string;
  active: boolean;
  applicants: number;
  matchCount: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRemote, setSelectedRemote] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Fetch jobs error:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.filter(j => j._id !== id));
        toast.success('Job deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete job');
    }
    setShowDeleteConfirm(null);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/jobs?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.map(j => 
          j._id === id ? { ...j, active: !currentActive } : j
        ));
        toast.success(`Job ${!currentActive ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesRemote = selectedRemote === 'all' || 
      (selectedRemote === 'remote' && job.remote) ||
      (selectedRemote === 'onsite' && !job.remote);
    return matchesSearch && matchesType && matchesRemote;
  });

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'fulltime': return 'bg-green-900/50 text-green-400';
      case 'parttime': return 'bg-blue-900/50 text-blue-400';
      case 'internship': return 'bg-yellow-900/50 text-yellow-400';
      case 'contract': return 'bg-purple-900/50 text-purple-400';
      default: return 'bg-gray-900/50 text-gray-400';
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Job Listings</h1>
              <p className="text-gray-400 text-sm mt-1">Manage and track job opportunities</p>
            </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Job</span>
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
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
            <select
              value={selectedRemote}
              onChange={(e) => setSelectedRemote(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Jobs</p>
            <p className="text-3xl font-bold text-white mt-2">{jobs.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Active Jobs</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {jobs.filter(j => j.active).length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Remote Jobs</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {jobs.filter(j => j.remote).length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Applicants</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {jobs.reduce((sum, j) => sum + (j.applicants || 0), 0)}
            </p>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-900 rounded-xl border p-6 transition-all ${
                  job.active ? 'border-gray-800 hover:border-gray-700' : 'border-red-900/30 opacity-60'
                }`}
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
                  <span className={`px-3 py-1 rounded-full text-xs ${getTypeColor(job.type)}`}>
                    {job.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {job.location} {job.remote && '🌐'}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    {formatSalary(job.salary)}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    {job.applicants || 0} applicants
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(job._id, job.active)}
                      className={`px-3 py-1 rounded-lg text-xs ${
                        job.active 
                          ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {job.active ? 'Active' : 'Inactive'}
                    </button>
                    <span className="text-xs text-gray-500">Source: {job.source}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-800 rounded-lg">
                      <PencilIcon className="h-4 w-4 text-gray-400" />
                    </button>
                    {showDeleteConfirm === job._id ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-2 bg-red-600 rounded-lg"
                        >
                          <CheckCircleIcon className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="p-2 bg-gray-700 rounded-lg"
                        >
                          <XCircleIcon className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(job._id)}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <TrashIcon className="h-4 w-4 text-gray-400" />
                      </button>
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
            <p className="text-gray-400">No jobs found</p>
          </div>
        )}
      </div>
      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onJobAdded={fetchJobs}
      />
    </DashboardLayout>
  );
}