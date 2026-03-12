'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter
} from 'recharts';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    activeJobs: number;
    placements: number;
    companies: number;
    avgMatchScore: number;
    avgSalary: number;
    placementRate: number;
    interviewSuccessRate: number;
  };
  trends: {
    monthly: Array<{
      month: string;
      placements: number;
      applications: number;
      interviews: number;
      offers: number;
    }>;
    weekly: Array<{
      week: string;
      views: number;
      applies: number;
      matches: number;
    }>;
  };
  departments: Array<{
    name: string;
    students: number;
    placed: number;
    avgScore: number;
    topSkills: string[];
  }>;
  skills: Array<{
    name: string;
    demand: number;
    supply: number;
    avgSalary: number;
    growth: number;
  }>;
  companies: Array<{
    name: string;
    hires: number;
    avgSalary: number;
    roles: string[];
  }>;
  placementTimeline: Array<{
    month: string;
    cs: number;
    it: number;
    ds: number;
    ece: number;
  }>;
  salaryRanges: Array<{
    range: string;
    count: number;
    avgScore: number;
  }>;
  geographic: Array<{
    location: string;
    jobs: number;
    candidates: number;
    avgSalary: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?timeRange=${timeRange}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time insights and trends from your placement data
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Placement Rate</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {data.overview.placementRate}%
                </p>
                <span className="text-xs text-green-400 mt-2 block">
                  ↑ 5.2% from last year
                </span>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Salary</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ${data.overview.avgSalary.toLocaleString()}
                </p>
                <span className="text-xs text-green-400 mt-2 block">
                  ↑ 8.3% increase
                </span>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Placements</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {data.overview.placements}
                </p>
                <span className="text-xs text-yellow-400 mt-2 block">
                  {data.overview.placements - 245} this year
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
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {data.overview.activeJobs}
                </p>
                <span className="text-xs text-purple-400 mt-2 block">
                  {data.overview.companies} companies hiring
                </span>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 - Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Placement Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends.monthly}>
                  <defs>
                    <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="placements" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorPlacements)" 
                    name="Placements"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="interviews" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorInterviews)" 
                    name="Interviews"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Skill Demand vs Supply</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.skills.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="demand" fill="#3B82F6" name="Demand %" />
                  <Bar yAxisId="left" dataKey="supply" fill="#10B981" name="Supply %" />
                  <Line yAxisId="right" type="monotone" dataKey="avgSalary" stroke="#F59E0B" name="Avg Salary (k)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 - Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.departments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {data.departments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {data.departments.map((dept, index) => (
                <div key={dept.name} className="flex justify-between text-sm">
                  <span className="text-gray-400">{dept.name}</span>
                  <span className="text-white">{dept.placed} placed</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Top Hiring Companies</h3>
            <div className="space-y-4">
              {data.companies.slice(0, 5).map((company, index) => (
                <div key={company.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{company.name}</p>
                      <p className="text-xs text-gray-400">{company.hires} hires</p>
                    </div>
                  </div>
                  <span className="text-green-400">${company.avgSalary}k</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Salary Ranges</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salaryRanges} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="range" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                    {data.salaryRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3 - Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Placement Timeline by Department</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.placementTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cs" stroke="#3B82F6" name="Computer Science" />
                  <Line type="monotone" dataKey="it" stroke="#10B981" name="IT" />
                  <Line type="monotone" dataKey="ds" stroke="#F59E0B" name="Data Science" />
                  <Line type="monotone" dataKey="ece" stroke="#EF4444" name="ECE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Skill Growth Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.skills.slice(0, 6)}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                  <Radar name="Demand" dataKey="demand" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="Growth" dataKey="growth" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Legend />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.geographic.map((loc) => (
              <div key={loc.location} className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-white font-medium">{loc.location}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Jobs</span>
                    <span className="text-white">{loc.jobs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Candidates</span>
                    <span className="text-white">{loc.candidates}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg Salary</span>
                    <span className="text-green-400">${loc.avgSalary}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(data, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `analytics_${new Date().toISOString().split('T')[0]}.json`;
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}