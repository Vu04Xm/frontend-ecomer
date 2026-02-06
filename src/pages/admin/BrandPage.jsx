import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Pencil, Trash2, Plus, Tag, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const BrandPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newBrand, setNewBrand] = useState({ name: "", status: "Active" });
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      const res = await axiosClient.get("/brands");
      setBrands(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang lưu...");
    try {
      await axiosClient.post("/brands", newBrand);
      toast.success("Thêm thành công!", { id: loadToast });
      setShowAddModal(false);
      setNewBrand({ name: "", status: "Active" });
      fetchBrands();
    } catch (err) {
      toast.error("Lỗi khi thêm mới", { id: loadToast });
    }
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang cập nhật...");
    try {
      await axiosClient.put(`/brands/${editingBrand.id}`, editingBrand);
      toast.success("Đã cập nhật!", { id: loadToast });
      setShowEditModal(false);
      fetchBrands();
    } catch (err) {
      toast.error("Lỗi cập nhật", { id: loadToast });
    }
  };

  // --- HÀM XÓA VỚI TOAST XÁC NHẬN ---
  const handleDelete = (brand) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-orange-500" size={20} />
          <p className="text-sm font-bold text-slate-800">
            Xóa thương hiệu <span className="text-orange-600">{brand.name}</span>?
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadToast = toast.loading("Đang xóa...");
              try {
                await axiosClient.delete(`/brands/${brand.id}`);
                toast.success("Đã xóa vĩnh viễn!", { id: loadToast });
                fetchBrands();
              } catch (err) {
                toast.error("Lỗi: Thương hiệu này có thể đang chứa sản phẩm!", { id: loadToast });
              }
            }}
            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-white bg-orange-600 shadow-md active:scale-95 transition-all"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        borderRadius: '1.5rem',
        background: '#fff',
        padding: '12px',
        minWidth: '320px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-orange-600 font-black text-[10px] tracking-widest uppercase">Đang tải dữ liệu...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Inter']">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-100">
                <Tag className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Thương hiệu</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Tổng số: {brands.length} đối tác</p>
            </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-orange-100 transition-all active:scale-95 uppercase text-xs"
        >
          <Plus size={18} /> Thêm Thương hiệu
        </button>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STT</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên thương hiệu</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {brands.map((brand, index) => (
              <tr key={brand.id} className="group hover:bg-orange-50/30 transition-all">
                <td className="px-8 py-5 font-bold text-slate-400 text-xs w-16">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="px-8 py-5 font-black text-slate-700 text-sm uppercase tracking-tight">{brand.name}</td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                    brand.status === 'Active' 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}>
                    {brand.status}
                  </span>
                </td>
                
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button 
                      onClick={() => { setEditingBrand(brand); setShowEditModal(true); }}
                      className="p-3 rounded-xl text-slate-400 hover:bg-white hover:text-orange-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(brand)}
                      className="p-3 rounded-xl text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2">
              <Plus className="text-orange-600" size={24} /> Tạo đối tác mới
            </h2>
            <form onSubmit={handleAddBrand} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên thương hiệu</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mt-2 outline-none focus:bg-white focus:border-orange-500 font-bold transition-all shadow-inner" 
                  placeholder="VD: Apple, Samsung..."
                  required 
                  onChange={e => setNewBrand({...newBrand, name: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Hủy</button>
                <button type="submit" className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 uppercase text-[10px] tracking-widest active:scale-95 transition-all">Lưu hệ thống</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SỬA */}
      {showEditModal && editingBrand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2">
              <Pencil className="text-orange-600" size={24} /> Cập nhật thương hiệu
            </h2>
            <form onSubmit={handleUpdateBrand} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên thương hiệu</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mt-2 outline-none focus:bg-white focus:border-orange-500 font-bold shadow-inner" 
                  value={editingBrand.name} 
                  onChange={e => setEditingBrand({...editingBrand, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái vận hành</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mt-2 outline-none font-bold cursor-pointer focus:border-orange-500" 
                  value={editingBrand.status} 
                  onChange={e => setEditingBrand({...editingBrand, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Tạm ngưng</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Đóng</button>
                <button type="submit" className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 uppercase text-[10px] tracking-widest active:scale-95 transition-all">Cập nhật ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandPage;