'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import {
  RocketLaunchIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  skills: Array<{ name: string; level: string; yearsOfExperience: number }>;
  experience: Array<{ company: string; role: string; startDate: string; endDate?: string; description: string }>;
  education: Array<{ institution: string; degree: string; field: string; startYear: number; endYear: number; grade?: string }>;
  preferences: {
    roles: string[];
    locations: string[];
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    jobType: string;
  };
  matchScore: number;
  status: string;
}

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
  type: string;
  postedDate: string;
  active: boolean;
}

interface MatchResult {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDept: string;
  jobId: string;
  jobTitle: string;
  company: string;
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    salary: number;
    cultural: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  interviewQuestions: string[];
  estimatedSalary: number;
  matchDate: Date;
}

export default function AIMatchingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [minScore, setMinScore] = useState(70);
  const [sortBy, setSortBy] = useState('score');
  const [aiModel, setAiModel] = useState('gemini');
  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
    fetchMatchHistory();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [studentsRes, jobsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/jobs?active=true')
      ]);
      
      const studentsData = await studentsRes.json();
      const jobsData = await jobsRes.json();
      
      if (studentsData.success) setStudents(studentsData.students);
      if (jobsData.success) setJobs(jobsData.jobs);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchHistory = async () => {
    try {
      const res = await fetch('/api/ai-match/history');
      const data = await res.json();
      if (data.success) {
        setMatchHistory(data.matches);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  const runAIMatching = async () => {
    try {
      setAnalyzing(true);
      toast.loading('AI is analyzing student profiles against job requirements...', { id: 'matching' });

      const res = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent === 'all' ? undefined : selectedStudent,
          minScore,
          model: aiModel
        })
      });

      const data = await res.json();

      if (data.success) {
        setMatches(data.matches);
        toast.success(`Found ${data.matches.length} high-quality matches!`, { id: 'matching' });
        
        // Show summary
        const avgScore = Math.round(data.matches.reduce((acc: number, m: MatchResult) => acc + m.score, 0) / data.matches.length);
        toast.success(`Average match score: ${avgScore}%`, { icon: '📊' });
        
        await fetchMatchHistory();
      } else {
        toast.error(data.error || 'Matching failed', { id: 'matching' });
      }
    } catch (error) {
      console.error('AI matching error:', error);
      toast.error('AI matching failed', { id: 'matching' });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-900/20 border-green-800';
    if (score >= 80) return 'bg-yellow-900/20 border-yellow-800';
    if (score >= 70) return 'bg-orange-900/20 border-orange-800';
    return 'bg-red-900/20 border-red-800';
  };

  const filteredMatches = matches
    .filter(m => m.score >= minScore)
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      if (sortBy === 'salary') return b.estimatedSalary - a.estimatedSalary;
      return 0;
    });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-6 border border-purple-800">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <RocketLaunchIcon className="h-6 w-6 mr-2 text-purple-400" />
                AI-Powered Matching Engine
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Advanced machine learning algorithms analyzing {students.length} students against {jobs.length} active jobs
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-800">
                <SparklesIcon className="h-4 w-4 text-purple-400" />
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none"
                >
                  <option value="gemini">Gemini Pro</option>
                  <option value="gpt4">GPT-4</option>
                  <option value="claude">Claude</option>
                </select>
              </div>
              <button
                onClick={runAIMatching}
                disabled={analyzing || students.length === 0 || jobs.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="h-5 w-5" />
                    <span>Run AI Matching</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Students</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Match Score</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span className="text-purple-400">{minScore}%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="score">Match Score</option>
                <option value="name">Student Name</option>
                <option value="company">Company</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchInitialData}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-800 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{students.length}</p>
                <p className="text-sm text-gray-400">Students in Database</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BriefcaseIcon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
                <p className="text-sm text-gray-400">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{matchHistory.length}</p>
                <p className="text-sm text-gray-400">Matches Generated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Match Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Top Matches ({filteredMatches.length})
            </h2>
            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
              <AnimatePresence>
                {filteredMatches.map((match, index) => (
                  <motion.div
                    key={`${match.studentId}-${match.jobId}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gray-900 rounded-xl p-4 border-2 cursor-pointer transition-all ${
                      selectedMatch?.studentId === match.studentId && selectedMatch?.jobId === match.jobId
                        ? 'border-purple-500 bg-gray-800'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-medium">{match.studentName}</h3>
                        <p className="text-sm text-gray-400">{match.studentDept}</p>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(match.score)}`}>
                        {match.score}%
                      </div>
                    </div>
                    <p className="text-sm text-purple-400 mb-2">{match.jobTitle}</p>
                    <p className="text-xs text-gray-500 mb-3">{match.company}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center text-gray-400">
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        ${match.estimatedSalary}k
                      </div>
                      <div className="flex items-center text-gray-400">
                        <StarIcon className="h-3 w-3 mr-1" />
                        Skills: {match.breakdown.skills}%
                      </div>
                    </div>

                    {match.score >= 90 && (
                      <div className="mt-2 flex items-center text-xs text-green-400">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Excellent Match
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredMatches.length === 0 && !analyzing && (
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                  <RocketLaunchIcon className="h-12 w-12 mx-auto text-gray-700 mb-3" />
                  <p className="text-gray-400">No matches found</p>
                  <p className="text-sm text-gray-500 mt-1">Run AI matching to generate matches</p>
                </div>
              )}
            </div>
          </div>

          {/* Match Details */}
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMatch.studentName}</h2>
                    <p className="text-gray-400">{selectedMatch.studentEmail}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedMatch.studentDept}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreColor(selectedMatch.score)}`}>
                      {selectedMatch.score}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Overall Match</p>
                  </div>
                </div>

                {/* Job Info */}
                <div className={`${getScoreBg(selectedMatch.score)} rounded-xl p-4 mb-6 border`}>
                  <h3 className="text-white font-semibold mb-2">{selectedMatch.jobTitle}</h3>
                  <p className="text-purple-400 text-sm mb-3">{selectedMatch.company}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-300">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      ${selectedMatch.estimatedSalary}k estimated
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {jobs.find(j => j._id === selectedMatch.jobId)?.location || 'Remote'}
                    </div>
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-400">Match Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedMatch.breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 capitalize">{key}</span>
                          <span className={getScoreColor(value)}>{value}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              value >= 90 ? 'bg-green-500' :
                              value >= 80 ? 'bg-yellow-500' :
                              value >= 70 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedMatch.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skill Gaps */}
                {selectedMatch.gaps.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center">
                      <LightBulbIcon className="h-4 w-4 mr-2" />
                      Skill Gaps to Address
                    </h3>
                    <ul className="space-y-2">
                      {selectedMatch.gaps.map((gap, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start">
                          <span className="text-yellow-400 mr-2">!</span>
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Recommendations */}
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-800 mb-6">
                  <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {selectedMatch.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start">
                        <span className="text-purple-400 mr-2">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interview Questions */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    AI-Generated Interview Questions
                  </h3>
                  <ul className="space-y-2">
                    {selectedMatch.interviewQuestions.map((question, index) => (
                      <li key={index} className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Schedule Interview
                  </button>
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Contact Student
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center h-full flex items-center justify-center">
                <div>
                  <RocketLaunchIcon className="h-16 w-16 mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-400 text-lg">Select a match to view detailed AI analysis</p>
                  <p className="text-sm text-gray-500 mt-2">Run AI matching to see intelligent job recommendations</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match History */}
        {matchHistory.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Match History</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {matchHistory.slice(0, 4).map((match: any, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white text-sm font-medium">{match.studentName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      match.score >= 90 ? 'bg-green-900/50 text-green-400' :
                      match.score >= 80 ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {match.score}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{match.jobTitle}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(match.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}