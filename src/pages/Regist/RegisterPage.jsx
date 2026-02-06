import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role_id: 3
  });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validate Số điện thoại (Phải là số và đúng 10 ký tự)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Số điện thoại phải đúng 10 chữ số!");
      return;
    }

    // 2. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Định dạng Email không hợp lệ!");
      return;
    }

    // 3. Validate Khớp mật khẩu
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    // 4. Validate Độ dài mật khẩu (Ví dụ tối thiểu 6 ký tự)
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    const loadingToast = toast.loading('Đang khởi tạo tài khoản...');

    try {
      await axiosClient.post('/register', { ...formData });
      toast.success('Đăng ký Smember thành công!', { id: loadingToast });
      
      // Chuyển trang sau 1.5s để người dùng kịp nhìn thông báo
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi: Không thể đăng ký tài khoản', {
        id: loadingToast
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-6 font-['Inter']">
      
      <div className="bg-white px-7 py-9 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.05)] w-full max-w-[380px] flex flex-col items-center">
        
        <div className="bg-[#e02020] p-3 rounded-2xl mb-4 shadow-lg shadow-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="text-center w-full mb-6">
          <h1 className="text-[20px] font-bold text-gray-800 mb-1">Đăng ký Smember</h1>
          <p className="text-gray-400 text-[12px]">Nhận ngay ưu đãi đặc quyền từ CellphoneS</p>
        </div>

        <form onSubmit={handleRegister} className="w-full flex flex-col space-y-3">
          
          <input 
            type="text" 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#e02020] text-[14px] transition-all"
            placeholder="Họ và tên *"
            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          />

          <input 
            type="text" 
            required
            maxLength={10} // Ngăn nhập quá 10 số ngay trên giao diện
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#e02020] text-[14px] transition-all"
            placeholder="Số điện thoại (10 số) *"
            value={formData.phone}
            onChange={(e) => {
              // Chỉ cho phép nhập số
              const val = e.target.value.replace(/[^0-9]/g, '');
              setFormData({...formData, phone: val});
            }}
          />

          <input 
            type="text" 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#e02020] text-[14px] transition-all"
            placeholder="Email (bắt buộc) *"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input 
            type="password" 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#e02020] text-[14px] transition-all"
            placeholder="Mật khẩu *"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <input 
            type="password" 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-[#f9fafb] outline-none focus:border-[#e02020] text-[14px] transition-all"
            placeholder="Nhập lại mật khẩu *"
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />

          <div className="flex items-start space-x-2 pt-1 pb-3 px-1">
            <input 
              type="checkbox" 
              required 
              className="mt-0.5 w-3.5 h-3.5 accent-red-600 border-gray-200 rounded cursor-pointer transition-all" 
              id="terms" 
            />
            <label htmlFor="terms" className="text-[10px] text-gray-500 leading-tight cursor-pointer select-none">
              Tôi đồng ý với các <span className="text-red-600">điều khoản bảo mật</span> cá nhân của CellphoneS
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#e02020] hover:bg-[#d70018] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-4px_rgba(224,32,32,0.4)] transition-all uppercase text-[14px] active:scale-[0.97] mt-2"
          >
            ĐĂNG KÝ NGAY
          </button>
        </form>

        <div className="w-full mt-6 pt-4 border-t border-gray-50 text-center">
          <p className="text-[13px] text-gray-400">
            Bạn đã có tài khoản? 
            <button 
              onClick={() => navigate('/login')}
              className="text-[#d70018] font-bold hover:underline ml-1"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;