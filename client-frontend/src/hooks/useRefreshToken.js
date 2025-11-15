import { api } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await api.post('/auth/refresh-token');
    setAuth((prev) => {
      // Update auth state with new access token
      return {
        ...prev,
        user: response.data.user, // The API might send back user data
        accessToken: response.data.accessToken,
      };
    });
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;