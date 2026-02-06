import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Pencil, Trash2, Plus, FolderTree, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newCategory, setNewCategory] = useState({ name: "", description: "", status: "Active" });
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get("/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang xử lý...");
    try {
      await axiosClient.post("/categories", newCategory);
      toast.success("Thêm danh mục thành công!", { id: loadToast });
      setShowAddModal(false);
      setNewCategory({ name: "", description: "", status: "Active" });
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi khi thêm danh mục!", { id: loadToast });
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang cập nhật...");
    try {
      await axiosClient.put(`/categories/${editingCategory.id}`, editingCategory);
      toast.success("Cập nhật thành công!", { id: loadToast });
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi khi cập nhật!", { id: loadToast });
    }
  };

  // --- HÀM XÓA VỚI TOAST XÁC NHẬN ---
  const handleDelete = (cat) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-indigo-500" size={20} />
          <p className="text-sm font-bold text-slate-800">
            Xóa danh mục <span className="text-indigo-600">{cat.name}</span>?
          </p>
        </div>
        <p className="text-[10px] text-slate-400 italic">Lưu ý: Chỉ xóa được nếu danh mục không chứa sản phẩm.</p>
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
                await axiosClient.delete(`/categories/${cat.id}`);
                toast.success("Đã xóa danh mục!", { id: loadToast });
                fetchCategories();
              } catch (err) {
                toast.error("Danh mục này đang có sản phẩm, không thể xóa!", { id: loadToast });
              }
            }}
            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-white bg-indigo-600 shadow-md active:scale-95 transition-all"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        borderRadius: '1.5rem',
        background: '#fff',
        padding: '16px',
        minWidth: '350px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      },
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-indigo-600 font-black text-[10px] tracking-widest uppercase">Đang tải danh mục...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Inter']">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                <FolderTree className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Phân loại</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Hiện có: {categories.length} danh mục</p>
            </div>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase text-xs"
        >
          <Plus size={18} /> Thêm danh mục mới
        </button>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STT</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Danh mục</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả</th>
              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
              <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.map((cat, index) => (
              <tr key={cat.id} className="group hover:bg-indigo-50/20 transition-all">
                <td className="px-8 py-5 font-bold text-slate-400 text-xs w-16">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="px-8 py-5 font-black text-slate-700 text-sm uppercase tracking-tight">{cat.name}</td>
                <td className="px-8 py-5 text-xs text-slate-500 max-w-[250px] truncate font-medium italic">
                  {cat.description || "Không có mô tả chi tiết"}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                    cat.status === 'Active' 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}>
                    {cat.status}
                  </span>
                </td>
                
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button 
                      onClick={() => { setEditingCategory(cat); setShowEditModal(true); }}
                      className="p-3 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat)}
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

      {/* MODALS */}
      {showAddModal && <Modal title="Tạo danh mục mới" close={() => setShowAddModal(false)} onSubmit={handleAddCategory} category={newCategory} setCategory={setNewCategory} />}
      {showEditModal && <Modal title="Cập nhật danh mục" close={() => setShowEditModal(false)} onSubmit={handleUpdateCategory} category={editingCategory} setCategory={setEditingCategory} isEdit />}
    </div>
  );
};

const Modal = ({ title, close, onSubmit, category, setCategory, isEdit }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-300">
    <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-[480px] shadow-2xl">
      <h2 className="text-xl font-black mb-8 text-slate-800 uppercase tracking-tight border-b border-slate-50 pb-5 flex items-center gap-3">
        <FolderTree className="text-indigo-600" size={24} /> {title}
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Tên danh mục</label>
          <input 
            type="text" 
            value={category.name}
            placeholder="VD: Điện thoại, Laptop..."
            className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner" 
            onChange={e => setCategory({...category, name: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Mô tả hệ thống</label>
          <textarea 
            value={category.description}
            placeholder="Mô tả ngắn gọn về loại hàng này..."
            className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl h-28 focus:border-indigo-500 focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-inner resize-none" 
            onChange={e => setCategory({...category, description: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Trạng thái vận hành</label>
          <select 
            className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-black text-slate-700 cursor-pointer transition-all shadow-inner"
            value={category.status}
            onChange={e => setCategory({...category, status: e.target.value})}
          >
            <option value="Active">Hoạt động (Active)</option>
            <option value="Inactive">Tạm ngưng (Inactive)</option>
          </select>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={close} className="flex-1 px-4 py-4 text-slate-400 font-black hover:text-slate-600 transition uppercase text-[10px] tracking-widest">Hủy bỏ</button>
          <button type="submit" className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 uppercase text-[10px] tracking-widest">
            {isEdit ? "Cập nhật ngay" : "Lưu danh mục"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default CategoryPage;