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
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import AddStudentModal from '../components/AddStudentModal';

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
  status: 'active' | 'placed' | 'training';
  placedAt?: string;
  placedCompany?: string;
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      console.error('Fetch students error:', error);
      toast.error('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStudents(students.filter(s => s._id !== id));
        toast.success('Student deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error deleting student');
    }
    setShowDeleteConfirm(null);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setStudents(students.map(s => 
          s._id === id ? { ...s, status: newStatus as any } : s
        ));
        toast.success('Status updated');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const exportToExcel = () => {
    const exportData = students.map(s => ({
      Name: s.name,
      Email: s.email,
      Department: s.department,
      'Graduation Year': s.graduationYear,
      'Match Score': `${s.matchScore}%`,
      Status: s.status,
      Skills: s.skills.map(sk => `${sk.name} (${sk.level})`).join(', '),
      'Placed Company': s.placedCompany || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported successfully');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || student.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = ['all', ...Array.from(new Set(students.map(s => s.department)))];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-900/50 text-green-400';
      case 'placed': return 'bg-blue-900/50 text-blue-400';
      case 'training': return 'bg-yellow-900/50 text-yellow-400';
      default: return 'bg-gray-900/50 text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

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
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>Add Student</span>
              </button>
            </div>
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
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="training">Training</option>
              <option value="placed">Placed</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-white mt-2">{students.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Placement Ready</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {students.filter(s => s.matchScore > 80).length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">In Training</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {students.filter(s => s.status === 'training').length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Successfully Placed</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {students.filter(s => s.status === 'placed').length}
            </p>
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
                      key={student._id}
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
                        <span className={`font-bold ${getScoreColor(student.matchScore)}`}>
                          {student.matchScore}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(student.status)} bg-gray-800 border-0 cursor-pointer`}
                        >
                          <option value="active">Active</option>
                          <option value="training">Training</option>
                          <option value="placed">Placed</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          {showDeleteConfirm === student._id ? (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDelete(student._id)}
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
                              onClick={() => setShowDeleteConfirm(student._id)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
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
      <AddStudentModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onStudentAdded={fetchStudents}
/>

      {/* Add/Edit Modal would go here - you can implement this similarly */}
    </DashboardLayout>
  );
}