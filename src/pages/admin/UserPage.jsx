import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { UserPlus, Edit3, Lock, Unlock, Users, Mail, Phone, Shield, AlertTriangle, X } from "lucide-react";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // State cho người dùng mới (Đã có trường phone)
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_id: 3,
    status: "active"
  });

  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang tạo tài khoản...");
    try {
      await axiosClient.post("/users", newUser);
      toast.success("Thêm tài khoản thành công!", { id: loadToast });
      setShowAddModal(false);
      setNewUser({ full_name: "", email: "", password: "", phone: "", role_id: 3, status: "active" });
      fetchUsers();
    } catch (err) {
      toast.error("Email đã tồn tại hoặc lỗi dữ liệu!", { id: loadToast });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang cập nhật...");
    try {
      await axiosClient.put(`/users/${editingUser.id}`, editingUser);
      toast.success("Cập nhật thành công!", { id: loadToast });
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Lỗi khi cập nhật!", { id: loadToast });
    }
  };

  const handleToggleStatus = (user) => {
    const isActive = (user.status || "").toLowerCase() === 'active';
    const actionText = isActive ? "Khóa" : "Mở khóa";

    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} />
          <p className="text-sm font-bold text-slate-800">
            Bạn muốn {actionText.toLowerCase()} <span className="text-blue-600">{user.full_name}</span>?
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400">Hủy</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadToast = toast.loading("Đang xử lý...");
              try {
                await axiosClient.put(`/users/${user.id}`, { 
                  ...user, 
                  status: isActive ? 'blocked' : 'active' 
                });
                toast.success(`Đã ${actionText.toLowerCase()} thành công!`, { id: loadToast });
                fetchUsers();
              } catch (err) {
                toast.error("Thao tác thất bại!", { id: loadToast });
              }
            }}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-white shadow-md active:scale-95 transition-all ${
              isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Inter']">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 text-white">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý thành viên</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Hệ thống phân quyền người dùng</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95 uppercase text-[10px] tracking-widest"
        >
          <UserPlus size={16} /> Thêm tài khoản mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành viên</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => {
                const isActive = (user.status || "").toLowerCase() === 'active';
                return (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700 text-sm ">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600"><Mail size={12} className="text-slate-300"/> {user.email}</div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-blue-500/70"><Phone size={12}/> {user.phone || "---"}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${
                        user.role_id === 1 ? "bg-purple-50 text-purple-600 border-purple-100" : 
                        user.role_id === 2 ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                      }`}>
                        <Shield size={10} /> {user.role_id === 1 ? "Admin" : user.role_id === 2 ? "Staff" : "Customer"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingUser(user); setShowEditModal(true); }} className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleToggleStatus(user)} className={`p-2.5 rounded-xl transition-all ${isActive ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                          {isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setShowAddModal(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600"><X size={20}/></button>
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2"><UserPlus className="text-blue-600" size={24} /> Tạo người dùng</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Họ và tên</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 focus:bg-white" onChange={e => setNewUser({...newUser, full_name: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email hệ thống</label>
                <input type="email" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 focus:bg-white" onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mật khẩu</label>
                  <input type="password" placeholder="••••••" className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 focus:bg-white" onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Số điện thoại</label>
                  <input type="text" placeholder="090..." className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 focus:bg-white" onChange={e => setNewUser({...newUser, phone: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-black text-[10px] uppercase outline-none" value={newUser.role_id} onChange={e => setNewUser({...newUser, role_id: Number(e.target.value)})}>
                  <option value={3}>Khách hàng</option><option value={2}>Nhân viên</option><option value={1}>Admin</option>
                </select>
                <select className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-black text-[10px] uppercase outline-none" value={newUser.status} onChange={e => setNewUser({...newUser, status: e.target.value})}>
                  <option value="active">Kích hoạt</option><option value="blocked">Khóa</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase text-[10px] hover:bg-blue-700 active:scale-95 transition-all mt-4">Xác nhận tạo tài khoản</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative animate-in zoom-in duration-200">
            <button onClick={() => setShowEditModal(false)} className="absolute right-6 top-6 text-slate-300 hover:text-slate-600"><X size={20}/></button>
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2"><Edit3 className="text-blue-600" size={24} /> Cập nhật thông tin</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Họ và tên</label>
                <input type="text" value={editingUser.full_name} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Số điện thoại</label>
                <input type="text" value={editingUser.phone || ""} className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-bold text-sm outline-none focus:border-blue-500" onChange={e => setEditingUser({...editingUser, phone: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Vai trò</label>
                  <select className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-black text-[10px] uppercase" value={editingUser.role_id} onChange={e => setEditingUser({...editingUser, role_id: Number(e.target.value)})}>
                    <option value={1}>Admin</option><option value={2}>Nhân viên</option><option value={3}>Khách hàng</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Trạng thái</label>
                  <select className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl font-black text-[10px] uppercase" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                    <option value="active">Active</option><option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase text-[10px] hover:bg-blue-700 active:scale-95 transition-all mt-4">Lưu thay đổi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;