import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Đảm bảo đã chạy npm install react-hot-toast

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Validate email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Định dạng Email không hợp lệ!', {
        duration: 3000,
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    // Tạo một hiệu ứng loading cho toast (tùy chọn nhưng chuyên nghiệp)
    const loadingToast = toast.loading('Đang xác thực thông tin...');

    try {
      const res = await axiosClient.post('/login', { email, password });

      // Lưu token & user
      localStorage.setItem('token', res.data.token);
      let userData = res.data.user;
      
      if (userData && userData.role && !userData.role_id) {
        userData.role_id = userData.role;
      }
      localStorage.setItem('user', JSON.stringify(userData));

      // 2. Thông báo thành công
      toast.success(`Chào mừng ${userData?.name || 'bạn'} trở lại!`, {
        id: loadingToast, // Ghi đè lên toast loading trước đó
      });

      // Đợi một chút để người dùng kịp thấy toast rồi mới chuyển trang
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (err) {
      // 3. Thông báo lỗi
      toast.error(err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!', {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-6 font-['Inter']">
      <div className="bg-white px-7 py-9 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] w-full max-w-[380px] flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center w-full mb-8">
          <h1 className="text-[28px] font-black text-[#d70018] uppercase tracking-tighter mb-1">
            SMEMBER
          </h1>
          <p className="text-gray-400 text-[13px]">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full">
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-[13px] font-bold text-[#444] mb-1.5 ml-1">
                Tài khoản
              </label>
              <input
                type="text"
                required
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#d70018] focus:ring-4 focus:ring-red-500/5 text-[14px] transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#444] mb-1.5 ml-1">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                placeholder="Mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#d70018] focus:ring-4 focus:ring-red-500/5 text-[14px] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#e02020] hover:bg-[#d70018] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-4px_rgba(224,32,32,0.4)] transition-all uppercase text-[14px] tracking-tight active:scale-[0.97]"
          >
            Đăng nhập
          </button>
        </form>

        <div className="w-full mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-[13px] text-gray-400">
            Chưa có tài khoản?
            <button
              onClick={() => navigate('/register')}
              className="text-[#d70018] font-bold hover:underline ml-1"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;