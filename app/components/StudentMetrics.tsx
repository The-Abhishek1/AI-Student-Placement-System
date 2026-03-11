'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserGroupIcon, AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function StudentMetrics({ students, onAnalyze }: any) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const metrics = {
    total: students.length,
    placed: students.filter((s: any) => s.matchScore > 80).length,
    inProgress: students.filter((s: any) => s.matchScore >= 60 && s.matchScore <= 80).length,
    needsWork: students.filter((s: any) => s.matchScore < 60).length
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <UserGroupIcon className="h-5 w-5 mr-2 text-blue-400" />
        Student Overview
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <p className="text-2xl font-bold text-white">{metrics.total}</p>
          <p className="text-xs text-gray-400">Total Students</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <p className="text-2xl font-bold text-green-400">{metrics.placed}</p>
          <p className="text-xs text-gray-400">Ready to Place</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <p className="text-2xl font-bold text-yellow-400">{metrics.inProgress}</p>
          <p className="text-xs text-gray-400">In Progress</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <p className="text-2xl font-bold text-red-400">{metrics.needsWork}</p>
          <p className="text-xs text-gray-400">Needs Training</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Recent Students</h3>
        {students.slice(0, 5).map((student: any) => (
          <motion.div
            key={student.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/30 p-3 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-all"
            onClick={() => {
              setSelectedStudent(student);
              onAnalyze(student.id);
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-white">{student.name}</p>
                <p className="text-xs text-gray-400">{student.department}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                student.matchScore > 80 ? 'bg-green-900/50 text-green-400' :
                student.matchScore > 60 ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {student.matchScore || 'N/A'}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        onClick={() => onAnalyze('all')}
      >
        Run AI Analysis on All
      </button>
    </div>
  );
}