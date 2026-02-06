import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Đảm bảo đúng port Backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào mỗi khi gửi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;