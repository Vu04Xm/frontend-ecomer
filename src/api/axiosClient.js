import axios from 'axios';

const axiosClient = axios.create({
  // Tự động lấy URL từ file .env.development hoặc .env.production
  // Nếu không tìm thấy biến môi trường, nó sẽ mặc định dùng link Render để an toàn
  baseURL: import.meta.env.VITE_API_URL || 'https://cellphones-backend.onrender.com/api', 
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