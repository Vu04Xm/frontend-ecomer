import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { 
  User, 
  Package, 
  History, 
  LogOut, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  UserCircle,
  Save,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // State cho thông tin cá nhân
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });

  // State cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
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
        phone: parsedUser.phone || ''
      });
    }
  }, [navigate]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    try {
      const res = await axiosClient.get(`/orders/user/${user.id}`);
      const sortedOrders = res.data.sort((a, b) => b.order_id - a.order_id);
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (['orders', 'history'].includes(activeTab) && user?.id) {
      fetchOrders();
    }
  }, [activeTab, user?.id]);

  const handleUpdateInfo = async () => {
    try {
      await axiosClient.put(`/users/update-profile/${user.id}`, profileData);
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi cập nhật thông tin");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    try {
      await axiosClient.put(`/users/change-password/${user.id}`, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      alert("Đổi mật khẩu thành công!");
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const processingOrders = orders.filter(o => ['Pending', 'Confirmed', 'Shipping'].includes(o.status));
  const historyOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Delivered': return { label: 'Thành công', icon: <CheckCircle2 size={14} />, class: 'bg-green-100 text-green-700' };
      case 'Cancelled': return { label: 'Đã hủy', icon: <XCircle size={14} />, class: 'bg-red-100 text-red-700' };
      case 'Shipping': return { label: 'Đang giao', icon: <Package size={14} />, class: 'bg-blue-100 text-blue-700' };
      default: return { label: status, icon: <Clock size={14} />, class: 'bg-amber-100 text-amber-700' };
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen text-red-600 font-black tracking-widest">ĐANG TẢI...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter']">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <img src="https://cdn2.cellphones.com.vn/x/media/wysiwyg/Web/logo_CPS_tet_2026.gif" alt="Logo" className="h-10 cursor-pointer object-contain" onClick={() => navigate('/')} />
          <button onClick={() => navigate('/')} className="text-xs font-black text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors">QUAY LẠI CỬA HÀNG <ChevronRight size={14} /></button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 mx-auto mb-4 p-1 border-2 border-red-100 rounded-full">
                <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/147/147144.png"} alt="avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <h3 className="text-xl font-black text-slate-800 leading-tight">{user.full_name}</h3>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">S-Member</p>
            </div>

            <nav className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 space-y-1">
              {[
                { id: 'info', label: 'Hồ sơ cá nhân', icon: <User size={18} /> },
                { id: 'password', label: 'Đổi mật khẩu', icon: <ShieldCheck size={18} /> },
                { id: 'orders', label: `Đang xử lý (${processingOrders.length})`, icon: <Package size={18} /> },
                { id: 'history', label: 'Lịch sử mua hàng', icon: <History size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === item.id 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-50">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </nav>
          </aside>

          <main className="lg:col-span-9">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 min-h-[600px]">
              
              {/* TAB THÔNG TIN CÁ NHÂN */}
              {activeTab === 'info' && (
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-red-50 rounded-2xl text-red-600"><UserCircle size={28} /></div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Thông tin tài khoản</h2>
                      <p className="text-sm text-slate-500 font-medium">Quản lý tên và số điện thoại của bạn</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 rounded-xl focus:border-red-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" value={profileData.full_name} onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 rounded-xl focus:border-red-500 focus:bg-white outline-none font-bold text-slate-700 transition-all" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <button onClick={handleUpdateInfo} className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100 uppercase text-xs tracking-widest">
                      <Save size={18} /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}

              {/* TAB ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <div className="max-w-md">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-100 rounded-2xl text-slate-800"><Lock size={28} /></div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Đổi mật khẩu</h2>
                      <p className="text-sm text-slate-500 font-medium">Bảo vệ tài khoản của bạn</p>
                    </div>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                      <input type="password" required className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:border-slate-800 outline-none font-bold text-slate-700 transition-all" placeholder="••••••••" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                      <input type="password" required className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:border-slate-800 outline-none font-bold text-slate-700 transition-all" placeholder="Tối thiểu 6 ký tự" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                      <input type="password" required className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:border-slate-800 outline-none font-bold text-slate-700 transition-all" placeholder="Nhập lại mật khẩu mới" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-100 uppercase text-xs tracking-widest">
                      Cập nhật mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {/* TAB ĐƠN HÀNG/LỊCH SỬ */}
              {(activeTab === 'orders' || activeTab === 'history') && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-slate-100 rounded-2xl text-slate-800">
                      {activeTab === 'orders' ? <Package size={28} /> : <History size={28} />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                        {activeTab === 'orders' ? 'Đơn hàng hiện tại' : 'Lịch sử mua hàng'}
                      </h2>
                    </div>
                  </div>
                  {/* ... (Phần render danh sách đơn hàng giữ nguyên như code trước) ... */}
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;