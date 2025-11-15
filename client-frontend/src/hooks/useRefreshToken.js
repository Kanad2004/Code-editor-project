import { api } from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    const response = await api.post('/auth/refresh-token');
    const { accessToken, user } = response.data.data;
    
    setAuth({ user, accessToken });
    return accessToken;
  };

  return refresh;
};

export default useRefreshToken;
