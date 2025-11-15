import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Layout = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // We call the /logout endpoint, but it's protected
      // We need a privateApi call for this.
      // But for simplicity, let's just clear auth state.
      // A proper implementation would call:
      // await privateApi.post('/auth/logout');
      
      setAuth({});
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-400">
            JudgePlatform
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/problems" className="hover:text-blue-300">
              Problems
            </Link>
            {auth?.accessToken ? (
              <>
                <span className="font-medium">Hi, {auth.user?.username}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-300">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;