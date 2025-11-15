import { useEffect } from 'react';
import { privateApi } from '../api/axios';
import useAuth from './useAuth';
import useRefreshToken from './useRefreshToken';

const usePrivateApi = () => {
  const { auth } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    // Request interceptor to add the auth header
    const requestIntercept = privateApi.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token expiry
    const responseIntercept = privateApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        // 401 == Unauthorized (our token is bad)
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // Mark as sent to avoid loops
          try {
            const newAccessToken = await refresh();
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return privateApi(prevRequest); // Retry the original request
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove interceptors
    return () => {
      privateApi.interceptors.request.eject(requestIntercept);
      privateApi.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return privateApi;
};

export default usePrivateApi;