import { api } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      const { accessToken, user } = response.data.data;
      
      // Update auth context (will auto-save to localStorage)
      setAuth({ user, accessToken });
      
      return accessToken;
    } catch (error) {
      // If refresh fails, clear auth and redirect to login
      setAuth({});
      localStorage.removeItem('auth');
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
