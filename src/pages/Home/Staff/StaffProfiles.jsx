import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../api/axiosClient";
import { User, Lock, Save, ShieldCheck, Phone, Mail, UserCircle, Settings, LogOut } from 'lucide-react'; // Thêm LogOut icon
import toast, { Toaster } from 'react-hot-toast';

const Profilestaff = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setProfileData({
        full_name: parsedUser.full_name || '',
        phone: parsedUser.phone || '',
        email: parsedUser.email || ''
      });
    }
  }, [navigate]);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Đã đăng xuất thành công');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Đang cập nhật...');
    try {
      await axiosClient.put(`/users/update-profile/${user.id}`, profileData);
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Cập nhật thông tin thành công!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật hồ sơ', { id: loadingToast });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp nhau!');
      return;
    }
    
    const loadingToast = toast.loading('Đang xử lý...');
    try {
      await axiosClient.put(`/users/change-password/${user.id}`, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.dismiss(loadingToast);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mật khẩu hiện tại không đúng', { id: loadingToast });
    }
  };

  if (!user) return <div className="p-10 text-center text-red-600 font-black">ĐANG TẢI...</div>;

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Inter']">
      <Toaster position="top-right" reverseOrder={false} />

      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <UserCircle className="text-red-600" size={38} />
            Hồ sơ Admin
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">Quản lý thông tin tài khoản và bảo mật</p>
        </div>

        {/* THANH NAV TABS & LOGOUT */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === 'profile' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} /> THÔNG TIN
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === 'password' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Lock size={16} /> MẬT KHẨU
            </button>
          </div>

          {/* NÚT ĐĂNG XUẤT THÊM MỚI */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-95 uppercase"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        {activeTab === 'profile' ? (
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-5">
              <Settings className="text-red-600" size={22} />
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Cập nhật tài khoản</h2>
            </div>

            <form onSubmit={handleUpdateInfo} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 rounded-xl focus:border-red-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 rounded-xl focus:border-red-500 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Địa chỉ Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      className="w-full bg-slate-100 border border-slate-200 pl-12 pr-5 py-4 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                      value={user.email}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="flex items-center gap-2 bg-red-600 text-white px-10 py-4 rounded-xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100 uppercase text-sm"
              >
                <Save size={18} /> Lưu thay đổi
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-8 border-b border-slate-50 pb-5">
              <ShieldCheck className="text-slate-900" size={24} />
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Thay đổi mật khẩu</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:border-slate-900 outline-none font-bold text-slate-700 transition-all"
                  placeholder="Nhập mật khẩu cũ"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:border-slate-900 outline-none font-bold text-slate-700 transition-all"
                  placeholder="Nhập mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:border-slate-900 outline-none font-bold text-slate-700 transition-all"
                  placeholder="Gõ lại mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase text-sm"
              >
                <Lock size={18} /> Cập nhật mật khẩu
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profilestaff;