import React from 'react';
import { Link } from 'react-router-dom';
import { IoCode, IoRocket, IoTrophy, IoFlash } from 'react-icons/io5';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

const Home = () => {
  const { auth } = useAuth();
  const { theme } = useTheme();

  const features = [
    {
      icon: <IoCode size={40} />,
      title: 'Monaco Editor',
      description: 'Professional code editor with syntax highlighting and IntelliSense',
    },
    {
      icon: <IoFlash size={40} />,
      title: 'Instant Feedback',
      description: 'Real-time code execution with detailed test results',
    },
    {
      icon: <IoTrophy size={40} />,
      title: 'Leaderboard',
      description: 'Compete with other coders and climb the ranks',
    },
    {
      icon: <IoRocket size={40} />,
      title: 'Multiple Languages',
      description: 'Support for C++, Java, Python, and JavaScript',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Master Your Coding Skills
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Practice coding problems, compete with others, and become a better developer
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {auth?.accessToken ? (
            <>
              <Link
                to="/problems"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
              >
                Browse Problems
              </Link>
              <Link
                to="/profile"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
              >
                View Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105`}
          >
            <div className="text-blue-400 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 my-12`}>
        <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
            <div className="text-gray-400">Problems</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">10K+</div>
            <div className="text-gray-400">Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">100K+</div>
            <div className="text-gray-400">Submissions</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
        <p className="text-gray-400 mb-8">
          Join thousands of developers improving their skills every day
        </p>
        <Link
          to="/problems"
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105 inline-block"
        >
          Start Practicing Now
        </Link>
      </div>
    </div>
  );
};

export default Home;
