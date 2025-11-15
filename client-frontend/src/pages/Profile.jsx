
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { IoTrophy, IoCheckmarkCircle, IoCalendar, IoCode } from 'react-icons/io5';
import toast from 'react-hot-toast';
import usePrivateApi from '../hooks/usePrivateApi';
import useAuth from '../hooks/useAuth';
import { SkeletonCard } from '../components/SkeletonLoader';
import { DIFFICULTY_COLORS } from '../utils/constants';
import useTheme from '../hooks/useTheme';

const Profile = () => {
  const { auth } = useAuth();
  const { theme } = useTheme();
  const privateApi = usePrivateApi();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          privateApi.get('/users/stats'),
          privateApi.get('/users/recent-activity'),
        ]);
        
        setStats(statsRes.data.data);
        setRecentActivity(activityRes.data.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [privateApi]);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );

  const solvedProblems = stats?.solved || { easy: 0, medium: 0, hard: 0, total: 0 };
  const acceptanceRate = stats?.acceptance_rate || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg mb-6`}>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold">
            {auth?.user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{auth?.user?.username}</h1>
            <p className="text-gray-400">{auth?.user?.email}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <IoCalendar />
              <span>Joined {format(new Date(auth?.user?.created_at || new Date()), 'MMMM yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Solved Problems */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <IoCheckmarkCircle size={32} className="text-green-400" />
            <h2 className="text-xl font-bold">Problems Solved</h2>
          </div>
          <div className="text-4xl font-bold mb-4">{solvedProblems.total}</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={DIFFICULTY_COLORS.Easy}>Easy</span>
              <span className="font-semibold">{solvedProblems.easy}</span>
            </div>
            <div className="flex justify-between">
              <span className={DIFFICULTY_COLORS.Medium}>Medium</span>
              <span className="font-semibold">{solvedProblems.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className={DIFFICULTY_COLORS.Hard}>Hard</span>
              <span className="font-semibold">{solvedProblems.hard}</span>
            </div>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <IoTrophy size={32} className="text-yellow-400" />
            <h2 className="text-xl font-bold">Acceptance Rate</h2>
          </div>
          <div className="text-4xl font-bold mb-4">{acceptanceRate.toFixed(1)}%</div>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Total Submissions</span>
              <span className="font-semibold">{stats?.total_submissions || 0}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Accepted</span>
              <span className="font-semibold text-green-400">{stats?.accepted_submissions || 0}</span>
            </div>
          </div>
        </div>

        {/* Languages Used */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <IoCode size={32} className="text-blue-400" />
            <h2 className="text-xl font-bold">Languages</h2>
          </div>
          <div className="space-y-3 mt-6">
            {stats?.languages_used?.map((lang, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize">{lang.language}</span>
                  <span className="text-gray-400">{lang.count}</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${(lang.count / stats.total_submissions) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )) || (
              <p className="text-gray-400">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'Accepted' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <p className="font-medium">{activity.problem_title}</p>
                    <p className="text-sm text-gray-400">
                      {activity.status} • {activity.language}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {format(new Date(activity.submitted_at), 'MMM dd, HH:mm')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
