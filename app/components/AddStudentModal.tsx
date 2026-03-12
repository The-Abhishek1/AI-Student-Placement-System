'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

export default function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    graduationYear: new Date().getFullYear(),
    skills: [{ name: '', level: 'beginner', yearsOfExperience: 0 }],
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (status !== 'authenticated') {
      toast.error('Please login first');
      return;
    }

    setLoading(true);

    try {
      // Filter out empty skills
      const validSkills = formData.skills.filter(s => s.name.trim() !== '');
      
      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        graduationYear: Number(formData.graduationYear),
        skills: validSkills,
        status: formData.status,
        matchScore: 0
      };

      console.log('Submitting student data:', studentData);

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify(studentData)
      });

      const data = await res.json();
      console.log('Response:', data);

      if (data.success) {
        toast.success('Student added successfully!');
        onStudentAdded();
        onClose();
        // Reset form
        setFormData({
          name: '',
          email: '',
          department: '',
          graduationYear: new Date().getFullYear(),
          skills: [{ name: '', level: 'beginner', yearsOfExperience: 0 }],
          status: 'active'
        });
      } else {
        toast.error(data.error || 'Failed to add student');
        if (data.details) {
          console.error('Validation details:', data.details);
        }
      }
    } catch (error) {
      console.error('Add student error:', error);
      toast.error('Error adding student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { name: '', level: 'beginner', yearsOfExperience: 0 }]
    });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const newSkills = [...formData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setFormData({ ...formData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      setFormData({
        ...formData,
        skills: formData.skills.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-gray-800">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-300"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white mb-4">
                      Add New Student
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Basic Info */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="student@example.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">
                            Department <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Graduation Year</label>
                          <input
                            type="number"
                            value={formData.graduationYear}
                            onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="2000"
                            max="2030"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="training">Training</option>
                          <option value="placed">Placed</option>
                        </select>
                      </div>

                      {/* Skills */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Skills</label>
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 mb-3">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Skill name (e.g., Python)"
                                value={skill.name}
                                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <select
                                value={skill.level}
                                onChange={(e) => updateSkill(index, 'level', e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Years of experience"
                                value={skill.yearsOfExperience}
                                onChange={(e) => updateSkill(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="50"
                              />
                              <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm transition-colors"
                                disabled={formData.skills.length === 1}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSkill}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          + Add Skill
                        </button>
                      </div>

                      {/* Error message area */}
                      {loading && (
                        <div className="text-sm text-blue-400">Adding student...</div>
                      )}

                      {/* Submit Buttons */}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Adding...' : 'Add Student'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          disabled={loading}
                          className="mt-3 inline-flex w-full justify-center rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700 sm:mt-0 sm:w-auto disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}