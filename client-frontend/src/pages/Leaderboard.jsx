import React, { useState, useEffect } from 'react';
import { IoTrophy, IoMedal } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { api } from '../api/axios';
import { SkeletonTable } from '../components/SkeletonLoader';
import useTheme from '../hooks/useTheme';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/leaderboard?period=${timeFilter}`);
        setLeaderboard(response.data.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeFilter]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <IoTrophy size={24} className="text-yellow-400" />;
    if (rank === 2) return <IoMedal size={24} className="text-gray-400" />;
    if (rank === 3) return <IoMedal size={24} className="text-orange-400" />;
    return null;
  };

  if (loading) return <SkeletonTable />;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IoTrophy className="text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-gray-400 mt-2">Top coders on the platform</p>
        </div>
        
        {/* Time Filter */}
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600`}
        >
          <option value="all-time">All Time</option>
          <option value="monthly">This Month</option>
          <option value="weekly">This Week</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <th className="py-3 px-2">Rank</th>
              <th className="py-3 px-2">User</th>
              <th className="py-3 px-2">Problems Solved</th>
              <th className="py-3 px-2">Acceptance Rate</th>
              <th className="py-3 px-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              leaderboard.map((user, index) => (
                <tr 
                  key={user._id} 
                  className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition`}
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      <span className="font-bold text-lg">{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-semibold">{user.problems_solved}</span>
                    <div className="text-xs text-gray-400">
                      E: {user.easy} • M: {user.medium} • H: {user.hard}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={user.acceptance_rate >= 50 ? 'text-green-400' : 'text-yellow-400'}>
                      {user.acceptance_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-blue-400 font-bold">{user.score}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Score Explanation */}
      <div className={`mt-6 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
        <h3 className="font-semibold mb-2">How is score calculated?</h3>
        <p className="text-sm text-gray-400">
          Score = (Easy × 1) + (Medium × 3) + (Hard × 5) + (Acceptance Rate × 10)
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
