'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
}

export default function AddJobModal({ isOpen, onClose, onJobAdded }: AddJobModalProps) {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    remote: false,
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    description: '',
    requirements: [''],
    skills: [''],
    type: 'fulltime'
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
      // Filter out empty requirements and skills
      const validRequirements = formData.requirements.filter(r => r.trim() !== '');
      const validSkills = formData.skills.filter(s => s.trim() !== '');
      
      const jobData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim() || 'Remote',
        remote: formData.remote,
        salary: {
          min: Number(formData.salary.min) || 0,
          max: Number(formData.salary.max) || 0,
          currency: formData.salary.currency
        },
        description: formData.description.trim(),
        requirements: validRequirements,
        skills: validSkills,
        type: formData.type,
        source: 'manual',
        active: true
      };

      console.log('Submitting job data:', jobData);

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData)
      });

      const data = await res.json();
      console.log('Response:', data);

      if (data.success) {
        toast.success('Job added successfully!');
        onJobAdded();
        onClose();
        // Reset form
        setFormData({
          title: '',
          company: '',
          location: '',
          remote: false,
          salary: { min: 0, max: 0, currency: 'USD' },
          description: '',
          requirements: [''],
          skills: [''],
          type: 'fulltime'
        });
      } else {
        toast.error(data.error || 'Failed to add job');
      }
    } catch (error) {
      console.error('Add job error:', error);
      toast.error('Error adding job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      setFormData({
        ...formData,
        requirements: formData.requirements.filter((_, i) => i !== index)
      });
    }
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 border border-gray-800">
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
                      Add New Job
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Job Title *</label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Company *</label>
                          <input
                            type="text"
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Location</label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                            placeholder="e.g., New York, NY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Job Type</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="fulltime">Full Time</option>
                            <option value="parttime">Part Time</option>
                            <option value="internship">Internship</option>
                            <option value="contract">Contract</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remote"
                          checked={formData.remote}
                          onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                          className="rounded border-gray-700 bg-gray-800 text-blue-600"
                        />
                        <label htmlFor="remote" className="text-sm text-gray-300">Remote Position</label>
                      </div>

                      {/* Salary */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Min Salary</label>
                          <input
                            type="number"
                            value={formData.salary.min}
                            onChange={(e) => setFormData({
                              ...formData,
                              salary: { ...formData.salary, min: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Max Salary</label>
                          <input
                            type="number"
                            value={formData.salary.max}
                            onChange={(e) => setFormData({
                              ...formData,
                              salary: { ...formData.salary, max: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Currency</label>
                          <select
                            value={formData.salary.currency}
                            onChange={(e) => setFormData({
                              ...formData,
                              salary: { ...formData.salary, currency: e.target.value }
                            })}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="INR">INR</option>
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Description *</label>
                        <textarea
                          required
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                          placeholder="Job description..."
                        />
                      </div>

                      {/* Requirements */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Requirements</label>
                        {formData.requirements.map((req, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={req}
                              onChange={(e) => updateRequirement(index, e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                              placeholder={`Requirement ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeRequirement(index)}
                              className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addRequirement}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          + Add Requirement
                        </button>
                      </div>

                      {/* Skills */}
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Skills</label>
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => updateSkill(index, e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                              placeholder={`Skill ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSkill}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          + Add Skill
                        </button>
                      </div>

                      {/* Submit Buttons */}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto disabled:opacity-50"
                        >
                          {loading ? 'Adding...' : 'Add Job'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="mt-3 inline-flex w-full justify-center rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700 sm:mt-0 sm:w-auto"
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