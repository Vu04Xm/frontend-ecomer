import axios from 'axios';

const axiosClient = axios.create({
  // Đã cập nhật sang link Backend trên Render của bạn
  baseURL: 'https://cellphones-backend.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm Token vào mỗi khi gửi request (Giữ nguyên logic bảo mật của bạn)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;