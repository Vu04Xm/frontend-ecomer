import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { TicketPercent, Plus, Trash2, Gift, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PromotionPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPromo, setNewPromo] = useState({
    type: "Product", 
    product_id: "",
    coupon_code: "", 
    title: "",
    discount_percent: 0,
    start_date: "",
    end_date: ""
  });

  const fetchData = async () => {
    try {
      const [promoRes, prodRes] = await Promise.all([
        axiosClient.get("/promotions"),
        axiosClient.get("/products")
      ]);
      setPromotions(promoRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPromo = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Đ đang lưu...");
    try {
      const payload = { 
        ...newPromo,
        product_id: newPromo.type === "Voucher" ? null : newPromo.product_id
      };

      await axiosClient.post("/promotions", payload);
      toast.success("Tạo thành công!", { id: loadToast });
      setShowAddModal(false);
      setNewPromo({ type: "Product", product_id: "", coupon_code: "", title: "", discount_percent: 0, start_date: "", end_date: "" });
      fetchData();
    } catch (err) {
      toast.error("Lỗi dữ liệu", { id: loadToast });
    }
  };

  // --- HÀM XÓA VỚI TOAST XÁC NHẬN ---
  const handleDelete = (promo) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} />
          <p className="text-sm font-bold text-slate-800">
            Bạn muốn xóa mã <span className="text-[#d70018]">{promo.magiamgia || promo.coupon_code}</span>?
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
                await axiosClient.delete(`/promotions/${promo.id}`);
                toast.success("Đã xóa vĩnh viễn!", { id: loadToast });
                fetchData();
              } catch (err) {
                toast.error("Không thể xóa mã này!", { id: loadToast });
              }
            }}
            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-white bg-[#d70018] shadow-sm active:scale-95 transition-all"
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="w-10 h-10 border-4 border-[#d70018] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[#d70018] font-black uppercase tracking-widest text-[10px]">Đang tải ưu đãi...</p>
    </div>
  );

  return (
    <div className="p-6 bg-[#f4f4f4] min-h-screen font-['Inter']">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#d70018] p-3 rounded-2xl shadow-lg shadow-red-100">
            <TicketPercent className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Chiến dịch ưu đãi</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Khuyến mãi & Mã giảm giá</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2 bg-[#d70018] hover:bg-[#b80015] text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-red-100 uppercase text-[10px] tracking-widest transition-all active:scale-95"
        >
          <Plus size={16} /> Tạo ưu đãi mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] p-2 border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-5 text-left">STT</th>
                <th className="px-6 py-5 text-left">Phạm vi</th>
                <th className="px-6 py-5 text-left">Áp dụng cho</th>
                <th className="px-6 py-5 text-left text-[#d70018]">Mã Nhập</th>
                <th className="px-6 py-5 text-center">Giảm giá</th>
                <th className="px-6 py-5 text-left">Thời hạn</th>
                <th className="px-6 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {promotions.map((p, index) => (
                <tr key={p.id || index} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5 text-slate-400 font-mono text-xs">{String(index + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-md border ${!p.product_id ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-[#d70018] bg-red-50 border-red-100'}`}>
                      {!p.product_id ? 'Toàn sàn' : 'Sản phẩm'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-700 font-bold text-sm">
                    {p.product_name || <span className="text-slate-400 italic">Tất cả sản phẩm</span>}
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-white text-[#d70018] px-3 py-1.5 rounded-xl border-2 border-dashed border-red-200 uppercase font-black text-[11px] shadow-sm">
                      {p.magiamgia || p.coupon_code || 'No Code'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-lg font-black text-xs shadow-md shadow-red-100">
                      -{p.discount_percent}%
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[10px] uppercase font-bold">
                    <div className="text-slate-800 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {new Date(p.start_date).toLocaleDateString()}</div>
                    <div className="text-slate-400 flex items-center gap-1.5 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {new Date(p.end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleDelete(p)} 
                      className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-[#d70018] hover:text-white transition-all shadow-sm group-hover:scale-110"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-[400px] shadow-2xl relative animate-in zoom-in duration-200">
            <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight flex items-center gap-2">
              <Gift className="text-[#d70018]" size={24} /> Thiết lập ưu đãi
            </h2>
            
            <form onSubmit={handleAddPromo} className="space-y-4">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl font-black">
                <button type="button" onClick={() => setNewPromo({...newPromo, type: 'Product'})} className={`flex-1 py-3 rounded-xl text-[9px] uppercase transition-all ${newPromo.type === 'Product' ? 'bg-white text-[#d70018] shadow-md' : 'text-slate-400'}`}>Theo sản phẩm</button>
                <button type="button" onClick={() => setNewPromo({...newPromo, type: 'Voucher'})} className={`flex-1 py-3 rounded-xl text-[9px] uppercase transition-all ${newPromo.type === 'Voucher' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>Toàn cửa hàng</button>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-2">Mã ưu đãi</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl font-black text-[#d70018] uppercase text-sm focus:border-[#d70018] focus:bg-white outline-none transition-all shadow-inner" 
                  placeholder="VD: GIAM30K" 
                  required 
                  value={newPromo.coupon_code}
                  onChange={e => setNewPromo({...newPromo, coupon_code: e.target.value.toUpperCase()})} 
                />
              </div>

              {newPromo.type === 'Product' && (
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-2">Sản phẩm áp dụng</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl font-bold text-sm outline-none focus:border-[#d70018]" 
                    required 
                    onChange={e => setNewPromo({...newPromo, product_id: e.target.value})}
                  >
                    <option value="">-- Danh sách sản phẩm --</option>
                    {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-2">Tên chương trình</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl font-bold text-sm focus:border-[#d70018] outline-none" placeholder="VD: SALE CUỐI TUẦN" required onChange={e => setNewPromo({...newPromo, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-2">Mức giảm (%)</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl font-black text-[#d70018] text-xl focus:border-[#d70018] outline-none shadow-inner" required onChange={e => setNewPromo({...newPromo, discount_percent: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-2">Bắt đầu</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl font-bold text-xs focus:border-[#d70018] outline-none" required onChange={e => setNewPromo({...newPromo, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-1.5 block ml-2">Kết thúc</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl font-bold text-xs focus:border-[#d70018] outline-none" required onChange={e => setNewPromo({...newPromo, end_date: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 font-black text-slate-400 uppercase text-[10px] tracking-widest">Hủy</button>
                <button type="submit" className="flex-[2] bg-[#d70018] text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 uppercase text-[10px] tracking-widest active:scale-95 transition-all">Kích hoạt mã</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionPage;