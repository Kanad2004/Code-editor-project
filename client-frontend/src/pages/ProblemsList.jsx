import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePrivateApi from '../hooks/usePrivateApi';
import Loader from '../components/Loader';

const ProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const privateApi = usePrivateApi();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await privateApi.get('/problems');
        setProblems(response.data.data);
      } catch (err) {
        console.error('Failed to fetch problems', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [privateApi]);

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Problems</h1>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2">Title</th>
            <th className="py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((prob) => (
            <tr key={prob._id} className="border-b border-gray-600">
              <td className="py-3">
                <Link
                  to={`/problems/${prob.slug}`}
                  className="text-blue-400 hover:underline"
                >
                  {prob.title}
                </Link>
              </td>
              <td className={prob.difficulty === 'Easy' ? 'text-green-400' : prob.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>
                {prob.difficulty}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemsList;