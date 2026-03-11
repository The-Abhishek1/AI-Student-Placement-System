'use client';

import { useEffect, useState } from 'react';
import { ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function SkillAnalysis({ students }: any) {
  const [skillData, setSkillData] = useState([]);

  useEffect(() => {
    // Aggregate skill data from students
    const skills = students.reduce((acc: any, student: any) => {
      student.skills?.forEach((skill: any) => {
        if (!acc[skill.name]) {
          acc[skill.name] = {
            skill: skill.name,
            average: 0,
            count: 0,
            total: 0
          };
        }
        const levelMap: any = { beginner: 40, intermediate: 60, advanced: 80, expert: 100 };
        acc[skill.name].total += levelMap[skill.level] || 50;
        acc[skill.name].count += 1;
      });
      return acc;
    }, {});

    const data = Object.values(skills).map((s: any) => ({
      skill: s.skill,
      value: Math.round(s.total / s.count)
    }));

    setSkillData(data as any);
  }, [students]);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2 text-purple-400" />
        Skill Analysis
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.3}
            />
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

      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
          <AcademicCapIcon className="h-4 w-4 mr-1" />
          AI Recommendations
        </h3>
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <p className="text-sm text-white">
            Focus on Cloud Computing and System Design - current gap of 35% in market demand
          </p>
        </div>
      </div>
    </div>
  );
}