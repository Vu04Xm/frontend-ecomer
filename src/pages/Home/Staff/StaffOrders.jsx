import React, { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { Clock, PackageCheck, RefreshCw, CheckCircle, XCircle } from "lucide-react";

const statusColorMap = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Shipping: "bg-purple-100 text-purple-700 border-purple-200",
  Delivered: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending_tab");

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get("/orders");
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      const activeOrders = (data || []).filter(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      );
      setOrders(activeOrders);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const actionText = newStatus === "Confirmed" ? "XÁC NHẬN" : "HỦY";
    const confirmChange = window.confirm(`Bạn có chắc chắn muốn ${actionText} đơn hàng #${orderId}?`);
    if (!confirmChange) return;

    try {
      await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus });

      // Nếu Hủy hoặc Giao xong thì xóa khỏi danh sách xử lý
      if (newStatus === "Cancelled" || newStatus === "Delivered") {
        setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
        alert(`Đơn hàng #${orderId} đã được chuyển vào mục lưu trữ.`);
      } else {
        // Nếu Xác nhận hoặc Shipping thì cập nhật trạng thái
        setOrders((prev) =>
          prev.map((order) =>
            order.order_id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Cập nhật thành công đơn hàng #${orderId}`);
      }
    } catch (err) {
      alert(`⚠️ Lỗi: ${err.response?.data?.message || "Thao tác thất bại!"}`);
      fetchOrders();
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const processingOrders = orders.filter((o) => o.status !== "Pending");
  const displayOrders = activeTab === "pending_tab" ? pendingOrders : processingOrders;

  if (loading) return <div className="p-10 text-center font-medium animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Quản lý quy trình đơn hàng</h3>
        <button 
                  onClick={fetchOrders} 
                  className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 text-sm font-bold transition-all active:scale-95"
                >
                  <RefreshCw size={16} /> Làm mới
                </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 w-fit">
        <button
          onClick={() => setActiveTab("pending_tab")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "pending_tab" ? "bg-orange-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Clock size={18} /> Cần xử lý ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("update_tab")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "update_tab" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <PackageCheck size={18} /> Cập nhật giao hàng ({processingOrders.length})
        </button>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-600">Mã đơn</th>
              <th className="px-6 py-4 text-left font-bold text-gray-600">Khách hàng</th>
              <th className="px-6 py-4 text-right font-bold text-gray-600">Tổng tiền</th>
              <th className="px-6 py-4 text-center font-bold text-gray-600">Trạng thái</th>
              <th className="px-6 py-4 text-center font-bold text-gray-600">Thao tác xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayOrders.length > 0 ? (
              displayOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-900">#OCPS{order.order_id}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-blue-700">{order.customer_name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{order.shipping_address}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-red-600">{Number(order.total_amount).toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusColorMap[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {activeTab === "pending_tab" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(order.order_id, "Confirmed")}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          <CheckCircle size={14} /> Duyệt đơn
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.order_id, "Cancelled")}
                          className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          <XCircle size={14} /> Hủy
                        </button>
                      </div>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white outline-none font-medium"
                      >
                        <option value="Confirmed">Confirmed (Chờ lấy hàng)</option>
                        <option value="Shipping">Shipping (Đang giao)</option>
                        <option value="Delivered">✅ Delivered (Thành công)</option>
                        <option value="Cancelled">❌ Cancelled (Hủy đơn)</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-20 text-gray-400 italic">Danh sách trống.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffOrders; 