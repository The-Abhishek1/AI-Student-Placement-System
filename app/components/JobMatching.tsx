'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function JobMatching({ matches, jobs, students }: any) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <BriefcaseIcon className="h-5 w-5 mr-2 text-green-400" />
        AI Job Matches
      </h2>

      <div className="space-y-4">
        <AnimatePresence>
          {matches.map((match: any, index: number) => (
            <motion.div
              key={match.job?.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/30 p-4 rounded-xl hover:bg-gray-800/50 transition-all cursor-pointer"
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-medium">{match.job?.title}</h3>
                  <p className="text-sm text-gray-400">{match.job?.company}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    match.matchResult?.overall > 85 ? 'text-green-400' :
                    match.matchResult?.overall > 70 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {match.matchResult?.overall}%
                  </span>
                  <p className="text-xs text-gray-500">Match Score</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div className="flex items-center text-gray-400">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {match.job?.location}
                </div>
                <div className="flex items-center text-gray-400">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  {match.job?.salary?.min}k - {match.job?.salary?.max}k
                </div>
              </div>

              {match.recommendations && (
                <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                  <p className="text-xs text-blue-400">AI Insight:</p>
                  <p className="text-sm text-white">{match.recommendations[0]}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BriefcaseIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No matches yet. Run AI analysis to see matches.</p>
          </div>
        )}
      </div>
    </div>
  );
}