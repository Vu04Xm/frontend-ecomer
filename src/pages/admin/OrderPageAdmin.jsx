import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { 
  Clock, PackageCheck, RefreshCw, CheckCircle, XCircle, AlertCircle 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const statusColorMap = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Shipping: "bg-purple-100 text-purple-700 border-purple-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const OrderPageAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending_tab");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/orders");
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setOrders(data || []);
    } catch (err) {
      toast.error("Lỗi tải dữ liệu đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm thực thi cập nhật API - Đã cập nhật để bắt lỗi chi tiết từ Backend
  const executeUpdate = async (orderId, newStatus, toastId) => {
    toast.dismiss(toastId);
    const loadingToast = toast.loading("Đang xử lý hệ thống...");
    try {
      const response = await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // Hiển thị thông báo thành công từ Server
      toast.success(response.data.message || "Cập nhật thành công!", { 
        id: loadingToast,
        duration: 3000 
      });
      
      fetchOrders(); // Tải lại danh sách để đồng bộ số lượng Tab
    } catch (err) {
      // Lấy câu báo lỗi từ Error của Backend (Ví dụ: "Không thể chuyển ngược từ Shipping về Confirmed!")
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Thao tác không hợp lệ";
      toast.error(errorMessage, { id: loadingToast, duration: 4000 });
    }
  };

  // Hàm hiển thị Toast xác nhận
  const confirmChangeStatus = (orderId, newStatus) => {
    const actionText = newStatus === "Confirmed" ? "DUYỆT" : "CẬP NHẬT";
    const subText = newStatus === "Delivered" ? "(Hệ thống sẽ tự động trừ kho hàng)" : "";
    
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-start gap-3">
          <AlertCircle size={22} className="text-orange-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-black text-gray-800 block">
              Xác nhận {actionText} đơn hàng #OCPS{orderId}?
            </span>
            {subText && <span className="text-[10px] text-red-500 font-bold italic">{subText}</span>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-[10px] font-black text-gray-500 uppercase hover:bg-gray-100 rounded-xl transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => executeUpdate(orderId, newStatus, t.id)}
            className="px-4 py-1.5 text-[10px] font-black text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 transition-all uppercase"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { 
      duration: 6000,
      position: "top-center",
      style: { minWidth: "320px", borderRadius: "20px", border: "1px solid #e5e7eb" } 
    });
  };

  // Logic phân loại Tab đồng bộ với Model (Chỉ hiện Pending ở tab 1, hiện các đơn đang xử lý ở tab 2)
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const updateOrders = orders.filter((o) => 
    ["Confirmed", "Shipping"].includes(o.status)
  );
  
  const displayOrders = activeTab === "pending_tab" ? pendingOrders : updateOrders;

  if (loading) return (
    <div className="p-10 text-center font-black text-gray-300 animate-pulse uppercase text-[10px] tracking-[0.3em]">
      Hệ thống đang đồng bộ dữ liệu...
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Quản lý quy trình</h3>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Giao diện điều hành & Cập nhật tồn kho</p>
        </div>
        <button 
          onClick={fetchOrders} 
          className="bg-white hover:shadow-lg text-gray-700 px-5 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 text-xs font-black transition-all active:scale-95"
        >
          <RefreshCw size={16} /> LÀM MỚI
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex bg-gray-200/60 p-1.5 rounded-[1.5rem] border border-gray-200 mb-8 w-fit shadow-inner">
        <button
          onClick={() => setActiveTab("pending_tab")}
          className={`flex items-center gap-2 px-8 py-3 rounded-[1.2rem] text-xs font-black transition-all duration-300 ${
            activeTab === "pending_tab" 
              ? "bg-white text-orange-600 shadow-xl border border-gray-100 scale-105" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Clock size={18} /> CẦN XỬ LÝ ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("update_tab")}
          className={`flex items-center gap-2 px-8 py-3 rounded-[1.2rem] text-xs font-black transition-all duration-300 ${
            activeTab === "update_tab" 
              ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <PackageCheck size={18} /> CẬP NHẬT GIAO HÀNG ({updateOrders.length})
        </button>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80 text-gray-400 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-left font-black uppercase text-[10px] tracking-widest">Mã đơn</th>
              <th className="px-8 py-5 text-left font-black uppercase text-[10px] tracking-widest">Khách hàng</th>
              <th className="px-8 py-5 text-right font-black uppercase text-[10px] tracking-widest">Tổng tiền</th>
              <th className="px-8 py-5 text-center font-black uppercase text-[10px] tracking-widest">Trạng thái</th>
              <th className="px-8 py-5 text-center font-black uppercase text-[10px] tracking-widest">Thao tác xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayOrders.length > 0 ? (
              displayOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-7 font-black text-gray-900">#OCPS{order.order_id}</td>
                  <td className="px-8 py-7">
                    <div className="font-black text-blue-800 text-base">{order.customer_name}</div>
                    <div className="text-[11px] text-gray-400 mt-1 font-bold italic truncate max-w-[250px]">{order.shipping_address}</div>
                  </td>
                  <td className="px-8 py-7 text-right font-black text-red-600 text-lg">
                    {Number(order.total_amount).toLocaleString()}đ
                  </td>
                  <td className="px-8 py-7 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColorMap[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-7">
                    {activeTab === "pending_tab" ? (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => confirmChangeStatus(order.order_id, "Confirmed")}
                          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                        >
                          <CheckCircle size={15} /> Duyệt đơn
                        </button>
                        <button
                          onClick={() => confirmChangeStatus(order.order_id, "Cancelled")}
                          className="bg-white hover:bg-red-50 text-red-600 border-2 border-red-100 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase flex items-center gap-2 transition-all active:scale-95"
                        >
                          <XCircle size={15} /> Hủy đơn
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <select
                          value={order.status}
                          onChange={(e) => confirmChangeStatus(order.order_id, e.target.value)}
                          className="bg-gray-50 border-2 border-gray-100 text-gray-700 rounded-2xl px-4 py-2.5 text-[11px] font-black uppercase outline-none cursor-pointer focus:ring-4 focus:ring-blue-50 transition-all hover:bg-white"
                        >
                          <option value="Confirmed">Confirmed (Chờ lấy hàng)</option>
                          <option value="Shipping">Shipping (Đang giao)</option>
                          <option value="Delivered">✅ Delivered (Giao xong)</option>
                          <option value="Cancelled">❌ Cancelled (Hủy đơn)</option>
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-32">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <PackageCheck size={48} />
                    <span className="font-black uppercase text-xs tracking-[0.4em]">Trống dữ liệu</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderPageAdmin;