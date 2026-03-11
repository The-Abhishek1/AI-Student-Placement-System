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
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MatchResult {
  studentId: string;
  studentName: string;
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
  };
  recommendations: string[];
}

export default function AIMatchingPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [autoMatch, setAutoMatch] = useState(true);

  const runAIMatching = async () => {
    try {
      setLoading(true);
      toast.loading('AI is analyzing matches...', { id: 'matching' });
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Sample matches - replace with actual API call
      const sampleMatches: MatchResult[] = [
        {
          studentId: '1',
          studentName: 'Sarah Chen',
          jobId: '101',
          jobTitle: 'Senior Software Engineer',
          company: 'Google',
          score: 98,
          breakdown: {
            skills: 95,
            experience: 100,
            education: 100,
            location: 95,
            salary: 98
          },
          recommendations: [
            'Perfect match for the role',
            'Strong system design skills',
            'Previous internship experience aligns well'
          ]
        },
        {
          studentId: '2',
          studentName: 'Alex Kumar',
          jobId: '102',
          jobTitle: 'Data Scientist',
          company: 'Microsoft',
          score: 94,
          breakdown: {
            skills: 92,
            experience: 90,
            education: 100,
            location: 95,
            salary: 92
          },
          recommendations: [
            'Excellent ML background',
            'Complete Kaggle competition for portfolio',
            'Strong Python skills'
          ]
        },
        {
          studentId: '3',
          studentName: 'Maria Garcia',
          jobId: '103',
          jobTitle: 'Security Analyst',
          company: 'AWS',
          score: 82,
          breakdown: {
            skills: 80,
            experience: 75,
            education: 85,
            location: 90,
            salary: 80
          },
          recommendations: [
            'Consider OSCP certification',
            'Gain more hands-on experience with cloud security',
            'Join CTF competitions'
          ]
        }
      ];
      
      setMatches(sampleMatches);
      toast.success('AI matching completed!', { id: 'matching' });
    } catch (error) {
      console.error('AI matching error:', error);
      toast.error('Matching failed', { id: 'matching' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoMatch) {
      runAIMatching();
    }
  }, [autoMatch]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <RocketLaunchIcon className="h-6 w-6 mr-2 text-purple-400" />
                AI-Powered Matching Engine
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Advanced algorithms analyzing student profiles against job requirements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoMatch}
                  onChange={(e) => setAutoMatch(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-700 bg-gray-800"
                />
                <span className="text-sm text-gray-300">Auto-match</span>
              </label>
              <button
                onClick={runAIMatching}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Processing...' : 'Run AI Matching'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-6 border border-purple-800">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">AI Model: Gemini Pro Active</h3>
              <p className="text-sm text-gray-400">
                Currently analyzing 1,247 student profiles against 3,892 job listings. 
                Match confidence: 94.2% accuracy rate.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">
                  Real-time processing
                </span>
                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">
                  Multi-dimensional matching
                </span>
                <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                  Skill gap analysis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Top Matches</h2>
            <AnimatePresence>
              {matches.map((match, index) => (
                <motion.div
                  key={match.studentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-900 rounded-xl p-4 border cursor-pointer transition-all ${
                    selectedMatch?.studentId === match.studentId
                      ? 'border-purple-500 bg-gray-800'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-medium">{match.studentName}</h3>
                      <p className="text-sm text-gray-400">{match.jobTitle}</p>
                      <p className="text-xs text-gray-500">{match.company}</p>
                    </div>
                    <div className={`text-2xl font-bold ${
                      match.score > 90 ? 'text-green-400' :
                      match.score > 80 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {match.score}%
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-gray-400">
                    <CheckCircleIcon className="h-3 w-3 mr-1 text-green-400" />
                    Skills match: {match.breakdown.skills}%
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Match Details */}
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedMatch.studentName}</h2>
                    <p className="text-gray-400">Matching with {selectedMatch.jobTitle} at {selectedMatch.company}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${
                      selectedMatch.score > 90 ? 'text-green-400' :
                      selectedMatch.score > 80 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedMatch.score}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Overall Match</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-400">Match Breakdown</h3>
                  {Object.entries(selectedMatch.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 capitalize">{key}</span>
                        <span className="text-white">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            value > 90 ? 'bg-green-500' :
                            value > 80 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Recommendations */}
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-800">
                  <h3 className="text-sm font-medium text-purple-400 mb-3 flex items-center">
                    <LightBulbIcon className="h-4 w-4 mr-2" />
                    AI Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {selectedMatch.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-green-400 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Schedule Interview
                  </button>
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
                    View Full Profile
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <RocketLaunchIcon className="h-16 w-16 mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400">Select a match to view detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}