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
  CreditCard
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
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
      case 'Delivered': return { label: 'Thành công', icon: <CheckCircle2 size={14} />, class: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'Cancelled': return { label: 'Đã hủy', icon: <XCircle size={14} />, class: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'Shipping': return { label: 'Đang giao', icon: <Package size={14} />, class: 'bg-sky-100 text-sky-700 border-sky-200' };
      default: return { label: status, icon: <Clock size={14} />, class: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      <p className="mt-4 text-sm font-black text-slate-400 uppercase tracking-tighter">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img 
            src="https://cdn2.cellphones.com.vn/x/media/wysiwyg/Web/logo_CPS_tet_2026.gif" 
            alt="Logo" 
            className="h-8 cursor-pointer" 
            onClick={() => navigate('/')} 
          />
          <button 
            onClick={() => navigate('/')} 
            className="group text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-all"
          >
            QUAY LẠI CỬA HÀNG 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 p-1 border-2 border-dashed border-red-200 rounded-full group-hover:border-red-500 transition-colors">
                  <img 
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/147/147144.png"} 
                    alt="avatar" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1.5 rounded-full border-2 border-white">
                  <ShieldCheck size={14} />
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800 mt-4 leading-tight">{user.full_name}</h3>
              <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-[10px] font-black bg-red-50 text-red-600 uppercase tracking-widest">
                S-Member
              </span>
            </div>

            <nav className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
              {[
                { id: 'info', label: 'Hồ sơ cá nhân', icon: <User size={18} /> },
                { id: 'password', label: 'Đổi mật khẩu', icon: <Lock size={18} /> },
                { id: 'orders', label: `Đang xử lý (${processingOrders.length})`, icon: <Package size={18} /> },
                { id: 'history', label: 'Lịch sử mua hàng', icon: <History size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all mb-1 last:mb-0 ${
                    activeTab === item.id 
                    ? 'bg-red-600 text-white shadow-md shadow-red-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
              <div className="my-2 border-t border-slate-100 mx-2"></div>
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 min-h-[600px]">
              
              {/* Tab: Personal Info */}
              {activeTab === 'info' && (
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 bg-red-50 rounded-2xl text-red-600">
                      <UserCircle size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cài đặt tài khoản</h2>
                      <p className="text-sm text-slate-400 font-medium">Cập nhật thông tin định danh của bạn trên hệ thống</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-red-600 transition-colors">Họ và tên</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 rounded-2xl focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 outline-none font-bold text-slate-700 transition-all" 
                            value={profileData.full_name} 
                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="group space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-red-600 transition-colors">Số điện thoại</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 rounded-2xl focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50 outline-none font-bold text-slate-700 transition-all" 
                            value={profileData.phone} 
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdateInfo} 
                      className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200 uppercase text-xs tracking-widest"
                    >
                      <Save size={18} /> Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Change Password */}
              {activeTab === 'password' && (
                <div className="max-w-md">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3.5 bg-slate-100 rounded-2xl text-slate-900">
                      <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Bảo mật</h2>
                      <p className="text-sm text-slate-400 font-medium">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</p>
                    </div>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    {[
                      { label: 'Mật khẩu hiện tại', key: 'oldPassword' },
                      { label: 'Mật khẩu mới', key: 'newPassword' },
                      { label: 'Xác nhận mật khẩu mới', key: 'confirmPassword' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                        <input 
                          type="password" 
                          required 
                          className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:border-slate-900 focus:bg-white outline-none font-bold text-slate-700 transition-all" 
                          placeholder="••••••••" 
                          value={passwordData[field.key]} 
                          onChange={(e) => setPasswordData({...passwordData, [field.key]: e.target.value})} 
                        />
                      </div>
                    ))}
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 mt-4 rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-100 uppercase text-xs tracking-widest">
                      Xác nhận đổi mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {/* Tab: Orders & History */}
              {(activeTab === 'orders' || activeTab === 'history') && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-slate-100 rounded-2xl text-slate-900">
                        {activeTab === 'orders' ? <Package size={32} /> : <History size={32} />}
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                        {activeTab === 'orders' ? 'Đơn hàng của tôi' : 'Lịch sử giao dịch'}
                      </h2>
                    </div>
                  </div>

                  {loadingOrders ? (
                    <div className="flex flex-col items-center py-20 opacity-50">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(activeTab === 'orders' ? processingOrders : historyOrders).length > 0 ? (
                        (activeTab === 'orders' ? processingOrders : historyOrders).map((order) => {
                          const status = getStatusInfo(order.status);
                          return (
                            <div key={order.order_id} className="group border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-red-100 hover:shadow-xl hover:shadow-red-50/50 p-5 rounded-3xl transition-all duration-300">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Mã đơn:</span>
                                    <span className="text-sm font-black text-slate-800">#{order.order_id}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                    <span className="flex items-center gap-1"><CreditCard size={14}/> {order.payment_method}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng thanh toán</p>
                                    <p className="text-lg font-black text-red-600">{Number(order.total_amount).toLocaleString()}đ</p>
                                  </div>
                                  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-wider ${status.class}`}>
                                    {status.icon} {status.label}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <div className="inline-flex p-4 bg-white rounded-full text-slate-300 mb-4 shadow-sm">
                            <Package size={40} />
                          </div>
                          <p className="text-slate-400 font-bold">Chưa có dữ liệu đơn hàng trong mục này</p>
                        </div>
                      )}
                    </div>
                  )}
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