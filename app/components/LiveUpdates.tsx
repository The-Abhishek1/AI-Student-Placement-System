'use client';

import { useState, useEffect } from 'react';
import { BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function LiveUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs?keywords=latest&location=remote');
      const data = await res.json();
      
      const liveUpdates = data.jobs.slice(0, 5).map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        time: new Date(),
        type: 'new-job'
      }));
      
      setUpdates(liveUpdates as any);
    } catch (error) {
      console.error('Live updates error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveUpdates();
    const interval = setInterval(fetchLiveUpdates, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <BellIcon className="h-5 w-5 mr-2 text-yellow-400" />
          Live Updates
        </h2>
        <button 
          onClick={fetchLiveUpdates}
          className="text-gray-400 hover:text-white transition-colors"
          disabled={loading}
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {updates.map((update: any) => (
          <div key={update.id} className="border-l-2 border-blue-500 pl-3 py-1">
            <p className="text-sm text-white">{update.title}</p>
            <p className="text-xs text-gray-400">{update.company}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(update.time, { addSuffix: true })}
            </p>
          </div>
        ))}

        {updates.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-4">No recent updates</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <span className="bg-gray-800/50 p-2 rounded text-center text-gray-400">TECH HIRING +23%</span>
        <span className="bg-gray-800/50 p-2 rounded text-center text-gray-400">REMOTE +40%</span>
      </div>
    </div>
  );
}