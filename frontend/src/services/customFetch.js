import axios from 'axios';

const customFetch = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format error responses nicely
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract a readable message
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'Something went wrong';

    console.error('API Error:', message);
    
    // Attach details to error object before rejecting
    error.formattedMessage = message;
    return Promise.reject(error);
  }
);

export default customFetch;
