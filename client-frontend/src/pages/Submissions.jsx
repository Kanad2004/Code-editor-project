import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { IoFilter, IoTime } from 'react-icons/io5';
import toast from 'react-hot-toast';
import usePrivateApi from '../hooks/usePrivateApi';
import { SkeletonTable } from '../components/SkeletonLoader';
import { STATUS_COLORS } from '../utils/constants';
import useTheme from '../hooks/useTheme';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 20;
  const privateApi = usePrivateApi();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await privateApi.get('/submissions/my-submissions');
        setSubmissions(response.data.data);
        setFilteredSubmissions(response.data.data);
      } catch (err) {
        console.error('Failed to fetch submissions', err);
        toast.error('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [privateApi]);

  // Filter by status
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(s => s.status === statusFilter));
    }
    setCurrentPage(1);
  }, [statusFilter, submissions]);

  // Pagination
  const indexOfLastSubmission = currentPage * submissionsPerPage;
  const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
  const currentSubmissions = filteredSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);
  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);

  if (loading) return <SkeletonTable />;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Submissions</h1>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <IoFilter className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600`}
          >
            <option value="All">All Status</option>
            <option value="Accepted">Accepted</option>
            <option value="Wrong Answer">Wrong Answer</option>
            <option value="Time Limit Exceeded">Time Limit Exceeded</option>
            <option value="Compilation Error">Compilation Error</option>
            <option value="Runtime Error">Runtime Error</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
          <p className="text-2xl font-bold">{submissions.length}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
          <p className="text-2xl font-bold text-green-400">
            {submissions.filter(s => s.status === 'Accepted').length}
          </p>
          <p className="text-sm text-gray-400">Accepted</p>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
          <p className="text-2xl font-bold text-red-400">
            {submissions.filter(s => s.status === 'Wrong Answer').length}
          </p>
          <p className="text-sm text-gray-400">Wrong Answer</p>
        </div>
        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded`}>
          <p className="text-2xl font-bold">
            {submissions.length > 0 
              ? ((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-sm text-gray-400">Acceptance Rate</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <th className="py-3 px-2">Time</th>
              <th className="py-3 px-2">Problem</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Language</th>
              <th className="py-3 px-2">Runtime</th>
            </tr>
          </thead>
          <tbody>
            {currentSubmissions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
                  No submissions yet. Start solving problems!
                </td>
              </tr>
            ) : (
              currentSubmissions.map((sub) => (
                <tr 
                  key={sub._id} 
                  className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition`}
                >
                  <td className="py-3 px-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <IoTime size={16} />
                      {format(new Date(sub.submitted_at), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Link
                      to={`/problems/${sub.problem?.slug}`}
                      className="text-blue-400 hover:underline"
                    >
                      {sub.problem?.title || 'Unknown'}
                    </Link>
                  </td>
                  <td className={`py-3 px-2 font-semibold ${STATUS_COLORS[sub.status]}`}>
                    {sub.status}
                  </td>
                  <td className="py-3 px-2 text-gray-400">
                    {sub.language.toUpperCase()}
                  </td>
                  <td className="py-3 px-2 text-gray-400">
                    {sub.execution_time ? `${sub.execution_time}ms` : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Submissions;
