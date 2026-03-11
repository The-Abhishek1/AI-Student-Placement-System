'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  skills: Array<{ name: string; level: string }>;
  matchScore: number;
  status: 'active' | 'placed' | 'training';
  avatar?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Fetch students error:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || student.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const departments = [...new Set(students.map(s => s.department))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Student Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage and track student progress</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span>Add Student</span>
            </button>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <FunnelIcon className="h-5 w-5" />
              <span>Filter</span>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-white mt-2">{students.length}</p>
            <span className="text-xs text-green-400 mt-2 block">+12 this month</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Placement Ready</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {students.filter(s => s.matchScore > 80).length}
            </p>
            <span className="text-xs text-gray-400 mt-2 block">Match score >80%</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">In Training</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {students.filter(s => s.status === 'training').length}
            </p>
            <span className="text-xs text-gray-400 mt-2 block">Skill development</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Successfully Placed</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {students.filter(s => s.status === 'placed').length}
            </p>
            <span className="text-xs text-gray-400 mt-2 block">This semester</span>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50 border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Student</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Department</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Skills</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Match Score</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <p className="text-sm text-gray-400">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white">{student.department}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map(skill => (
                            <span key={skill.name} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                              {skill.name}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                              +{student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          student.matchScore > 80 ? 'bg-green-900/50 text-green-400' :
                          student.matchScore > 60 ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {student.matchScore}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          student.status === 'placed' ? 'bg-blue-900/50 text-blue-400' :
                          student.status === 'active' ? 'bg-green-900/50 text-green-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <TrashIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <ChartBarIcon className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No students found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}