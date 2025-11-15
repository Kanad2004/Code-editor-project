import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to the Online Judge
      </h1>
      <p className="text-lg mb-8">
        Hone your skills. Solve challenges. Get judged.
      </p>
      <Link
        to="/problems"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        View Problems
      </Link>
    </div>
  );
};

export default Home;