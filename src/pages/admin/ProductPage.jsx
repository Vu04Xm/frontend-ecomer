import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { Pencil, Trash2, Plus, Package, Search, Filter, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const brands = [
    { id: 1, name: "Apple" }, { id: 2, name: "Samsung" },
    { id: 3, name: "Xiaomi" }, { id: 4, name: "Asus" }, { id: 7, name: "Oppo" }
  ];

  const categories = [
    { id: 1, name: "Smartphone" }, { id: 2, name: "Laptop" },
    { id: 3, name: "Phụ kiện" }, { id: 7, name: "Âm thanh" }, { id: 8, name: "Màn hình" }
  ];

  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", quantity: "", product_image: "",
    status: "In Stock", category_id: 1, brand_id: 1,
    discount: 10, description: ""
  });

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get("/products");
      setProducts(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter((item) => {
    const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === "All" || Number(item.brand_id) === Number(filterBrand);
    const matchesCategory = filterCategory === "All" || Number(item.category_id) === Number(filterCategory);
    return matchesName && matchesBrand && matchesCategory;
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang lưu sản phẩm...");
    try {
      await axiosClient.post("/products", newProduct);
      toast.success("Thêm sản phẩm thành công!", { id: loadToast });
      setShowAddModal(false);
      setNewProduct({
        name: "", price: "", quantity: "", product_image: "",
        status: "In Stock", category_id: 1, brand_id: 1,
        discount: 10, description: ""
      });
      fetchProducts();
    } catch (err) {
      toast.error("Lỗi khi thêm sản phẩm!", { id: loadToast });
    }
  };

  // --- HÀM XÓA VỚI TOAST XÁC NHẬN ---
  const handleDelete = (item) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-sm font-bold text-slate-800">
            Xóa vĩnh viễn <span className="text-red-600">{item.name}</span>?
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
                await axiosClient.delete(`/products/${item.id}`);
                toast.success("Đã xóa khỏi kho!", { id: loadToast });
                fetchProducts();
              } catch (err) {
                toast.error("Không thể xóa sản phẩm này!", { id: loadToast });
              }
            }}
            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-white bg-red-600 shadow-md active:scale-95 transition-all"
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
        border: '1px solid #f1f5f9',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
    });
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đang cập nhật...");
    try {
      await axiosClient.put(`/products/${editingProduct.id}`, editingProduct);
      toast.success("Cập nhật thành công!", { id: loadToast });
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      toast.error("Lỗi khi cập nhật!", { id: loadToast });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-red-600 font-black text-[10px] tracking-widest">ĐANG TẢI DỮ LIỆU...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-['Inter']">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-100">
                <Package className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Quản lý kho</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Tổng cộng: {filteredProducts.length} sản phẩm</p>
            </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-red-100 transition-all active:scale-95 uppercase text-xs"
        >
          <Plus size={18} /> Thêm mới sản phẩm
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm tên sản phẩm..." 
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-red-500 font-bold text-slate-700 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none cursor-pointer font-bold text-slate-600 appearance-none shadow-sm"
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="All">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none cursor-pointer font-bold text-slate-600 appearance-none shadow-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">Tất cả thể loại</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STT</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sản phẩm</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá bán</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-5 font-bold text-slate-400 text-xs">{String(index + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                            <img src={item.product_image} className="w-14 h-14 object-cover rounded-2xl border border-slate-100 shadow-sm transition-transform group-hover:scale-110" alt="" />
                            <div className="font-black text-slate-700 text-sm leading-tight">{item.name}</div>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-red-600 font-black text-base">{Number(item.price).toLocaleString()}đ</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => { setEditingProduct(item); setShowEditModal(true); }} className="p-3 rounded-xl text-slate-400 hover:bg-white hover:text-slate-800 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-3 rounded-xl text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">Không tìm thấy sản phẩm</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM MỚI */}
      {showAddModal && (
        <ProductModal 
          title="Thêm sản phẩm mới" 
          close={() => setShowAddModal(false)} 
          onSubmit={handleAddProduct} 
          product={newProduct} 
          setProduct={setNewProduct} 
          brands={brands}
          categories={categories}
        />
      )}

      {/* MODAL SỬA */}
      {showEditModal && editingProduct && (
        <ProductModal 
          title="Chỉnh sửa sản phẩm" 
          close={() => setShowEditModal(false)} 
          onSubmit={handleSaveUpdate} 
          product={editingProduct} 
          setProduct={setEditingProduct} 
          brands={brands}
          categories={categories}
          isEdit
        />
      )}
    </div>
  );
};

// Component Modal chung
const ProductModal = ({ title, close, onSubmit, product, setProduct, brands, categories, isEdit }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-300">
    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-black mb-8 text-slate-800 uppercase border-b border-slate-50 pb-5 flex items-center gap-3">
        <Package className="text-red-600" size={24}/> {title}
      </h2>
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên sản phẩm</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-red-500 outline-none font-bold mt-2 transition-all shadow-inner" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} required />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thương hiệu</label>
          <select className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl mt-2 font-bold cursor-pointer outline-none focus:border-red-500" value={product.brand_id} onChange={e => setProduct({...product, brand_id: Number(e.target.value)})}>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá bán (VNĐ)</label>
          <input type="number" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-red-500 outline-none font-bold mt-2 text-red-600 shadow-inner" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} required />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đường dẫn hình ảnh (URL)</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl focus:bg-white focus:border-red-500 outline-none font-bold mt-2 shadow-inner" placeholder="https://..." value={product.product_image} onChange={e => setProduct({...product, product_image: e.target.value})} required />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả sản phẩm</label>
          <textarea className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl h-32 focus:bg-white focus:border-red-500 outline-none font-bold mt-2 resize-none transition-all shadow-inner" value={product.description} onChange={e => setProduct({...product, description: e.target.value})} required />
        </div>
        <div className="col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-50">
          <button type="button" onClick={close} className="px-6 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600">Đóng</button>
          <button type="submit" className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all uppercase text-[10px] tracking-widest">
            {isEdit ? "Cập nhật sản phẩm" : "Lưu vào kho"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default ProductPage;