import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoSearch, IoFilter } from 'react-icons/io5';
import toast from 'react-hot-toast';
import usePrivateApi from '../hooks/usePrivateApi';
import useDebounce from '../hooks/useDebounce';
import { SkeletonTable } from '../components/SkeletonLoader';
import { DIFFICULTY_COLORS } from '../utils/constants';
import useTheme from '../hooks/useTheme';

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const privateApi = usePrivateApi();
  const { theme } = useTheme();
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await privateApi.get('/problems');
        setProblems(response.data.data);
        setFilteredProblems(response.data.data);
      } catch (err) {
        console.error('Failed to fetch problems', err);
        toast.error('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [privateApi]);

  // Filter and search
  useEffect(() => {
    let result = [...problems];

    // Search filter
    if (debouncedSearch) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      result = result.filter(p => p.difficulty === difficultyFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      return 0;
    });

    setFilteredProblems(result);
  }, [debouncedSearch, difficultyFilter, sortBy, problems]);

  if (loading) return <SkeletonTable />;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Problems</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <IoSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600 w-full md:w-64`}
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <IoFilter className="text-gray-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600`}
            >
              <option value="All">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border border-gray-600`}
          >
            <option value="title">Sort by Title</option>
            <option value="difficulty">Sort by Difficulty</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-400 mb-4">
        Showing {filteredProblems.length} of {problems.length} problems
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <th className="py-3 px-2">#</th>
              <th className="py-3 px-2">Title</th>
              <th className="py-3 px-2">Difficulty</th>
              <th className="py-3 px-2">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-400">
                  No problems found
                </td>
              </tr>
            ) : (
              filteredProblems.map((prob, index) => (
                <tr 
                  key={prob._id} 
                  className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition`}
                >
                  <td className="py-3 px-2">{index + 1}</td>
                  <td className="py-3 px-2">
                    <Link
                      to={`/problems/${prob.slug}`}
                      className="text-blue-400 hover:underline font-medium"
                    >
                      {prob.title}
                    </Link>
                  </td>
                  <td className={`py-3 px-2 font-semibold ${DIFFICULTY_COLORS[prob.difficulty]}`}>
                    {prob.difficulty}
                  </td>
                  <td className="py-3 px-2 text-gray-400">
                    {prob.acceptance_rate ? `${prob.acceptance_rate}%` : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemsList;
