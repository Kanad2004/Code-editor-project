import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { IoMoon, IoSunny, IoMenu, IoClose } from 'react-icons/io5';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import usePrivateApi from '../hooks/usePrivateApi';
import toast from 'react-hot-toast';
import Modal from './Modal';

const Layout = () => {
  const { auth, setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const privateApi = usePrivateApi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Session timeout warning (2 min before expiry - 5 min remaining of 7 min)
  useEffect(() => {
    if (!auth?.accessToken) return;

    const warningTimer = setTimeout(() => {
      setShowSessionWarning(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(warningTimer);
  }, [auth]);

  const handleLogout = async () => {
    try {
      await privateApi.post('/auth/logout');
      setAuth({});
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
      // Even if API fails, clear local auth
      setAuth({});
      navigate('/login');
    }
  };

  const handleStayLoggedIn = () => {
    setShowSessionWarning(false);
    // Refresh token will be auto-refreshed on next API call
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-400">
            CodeJudge
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/problems" className="hover:text-blue-300 transition">
              Problems
            </Link>
            <Link to="/leaderboard" className="hover:text-blue-300 transition">
              Leaderboard
            </Link>
            {auth?.accessToken && (
              <>
                <Link to="/submissions" className="hover:text-blue-300 transition">
                  My Submissions
                </Link>
                <Link to="/profile" className="hover:text-blue-300 transition">
                  Profile
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IoSunny size={20} /> : <IoMoon size={20} />}
            </button>
            {auth?.accessToken ? (
              <>
                <span className="font-medium">Hi, {auth.user?.username}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col gap-4">
              <Link to="/problems" className="hover:text-blue-300 transition" onClick={() => setMobileMenuOpen(false)}>
                Problems
              </Link>
              <Link to="/leaderboard" className="hover:text-blue-300 transition" onClick={() => setMobileMenuOpen(false)}>
                Leaderboard
              </Link>
              {auth?.accessToken && (
                <>
                  <Link to="/submissions" className="hover:text-blue-300 transition" onClick={() => setMobileMenuOpen(false)}>
                    My Submissions
                  </Link>
                  <Link to="/profile" className="hover:text-blue-300 transition" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition text-left"
                  >
                    Logout
                  </button>
                </>
              )}
              {!auth?.accessToken && (
                <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition text-center">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      <footer className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 text-center`}>
        <p className="text-sm text-gray-400">
          © 2025 CodeJudge. Built with React, Node.js, Java & RabbitMQ
        </p>
      </footer>

      {/* Session Warning Modal */}
      <Modal
        isOpen={showSessionWarning}
        onClose={() => setShowSessionWarning(false)}
        title="Session Expiring Soon"
      >
        <p className="mb-4">Your session will expire in 2 minutes. Would you like to stay logged in?</p>
        <div className="flex gap-4">
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded"
          >
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
