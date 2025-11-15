import React, { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { validateEmail, validatePassword, validateUsername, getPasswordStrength } from '../utils/validators';
import useTheme from '../hooks/useTheme';

const Register = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  const validate = () => {
    const newErrors = {};
    
    // Username
    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;
    
    // Email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = 'Password must have: ' + passwordErrors.join(', ');
    }
    
    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-2 rounded mb-4">
              {errors.submit}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Username</label>
            <input
              type="text"
              name="username"
              className={`w-full p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${
                errors.username ? 'border-red-500' : 'border-gray-600'
              }`}
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className={`w-full p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`w-full p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            {passwordStrength && (
              <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                Strength: {passwordStrength.strength}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`w-full p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded font-semibold disabled:bg-gray-600 transition"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
