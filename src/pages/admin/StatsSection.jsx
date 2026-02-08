import React, { useState, useEffect, useCallback } from "react";
import axiosClient from "../../api/axiosClient";
import { 
  TrendingUp, Users, Package, ShoppingCart, 
  RefreshCw, Calendar, BarChart3, RotateCcw 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import toast, { Toaster } from "react-hot-toast";

const StatsSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State quản lý bộ lọc
  const [filters, setFilters] = useState({
    day: "",
    month: new Date().getMonth() + 1,
    year: 2026,
  });

  // Hàm lấy dữ liệu từ API
  const fetchStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Loại bỏ các params trống trước khi gửi
      const cleanParams = {};
      if (filters.day) {
        cleanParams.day = filters.day;
      } else {
        if (filters.month) cleanParams.month = filters.month;
        if (filters.year) cleanParams.year = filters.year;
      }

      const res = await axiosClient.get("/stats/dashboard", { params: cleanParams });
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể kết nối tới máy chủ!");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Hàm Reset bộ lọc về mặc định
  const handleResetFilters = () => {
    setFilters({
      day: "",
      month: new Date().getMonth() + 1,
      year: 2026,
    });
    toast.success("Đã đặt lại bộ lọc");
  };

  // Xử lý dữ liệu biểu đồ để luôn hiển thị đủ 12 tháng (kể cả tháng chưa có doanh thu)
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const found = stats?.monthlyRevenue?.find(m => m.month === monthNum);
    return { 
      month: monthNum, 
      revenue: found ? Number(found.revenue) : 0 
    };
  });

  if (loading && !stats) return (
    <div className="p-10 text-center font-black text-gray-400 animate-pulse uppercase tracking-widest">
      Đang trích xuất dữ liệu hệ thống...
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      <Toaster position="top-right" />
      
      {/* HEADER & FILTERS */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-gray-800">Báo cáo doanh thu</h3>
          <p className="text-gray-400 text-[10px] font-bold uppercase mt-1 italic tracking-wider">
            {filters.day ? `Chi tiết ngày: ${filters.day}` : `Tháng ${filters.month} / Năm ${filters.year}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-2">
          <div className="flex items-center gap-2 px-2 border-r border-gray-100">
            <Calendar size={14} className="text-gray-400" />
            <input 
              type="date" 
              name="day" 
              value={filters.day} 
              onChange={(e) => setFilters({...filters, day: e.target.value})} 
              className="text-[10px] font-bold bg-transparent outline-none w-28" 
            />
          </div>

          <select 
            value={filters.month} 
            onChange={(e) => setFilters({...filters, month: e.target.value})} 
            disabled={!!filters.day}
            className="text-[10px] font-bold bg-transparent outline-none px-2 border-r border-gray-100 disabled:opacity-30 cursor-pointer"
          >
            {Array.from({length: 12}, (_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            {/* BUTTON RESET */}
            <button 
              onClick={handleResetFilters}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={16} />
            </button>

            {/* BUTTON FETCH */}
            <button 
              onClick={fetchStats} 
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black transition-all active:scale-95 shadow-lg shadow-red-200"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> 
              CẬP NHẬT
            </button>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<TrendingUp size={20} className="text-red-600" />} label="Tổng doanh thu" value={`${Number(stats?.totalRevenue || 0).toLocaleString()}đ`} bgColor="bg-red-50" />
        <StatCard icon={<ShoppingCart size={20} className="text-blue-600" />} label="Đơn hàng" value={stats?.totalOrders || 0} bgColor="bg-blue-50" />
        <StatCard icon={<Users size={20} className="text-purple-600" />} label="Khách hàng" value={stats?.totalCustomers || 0} bgColor="bg-purple-50" />
        <StatCard icon={<Package size={20} className="text-orange-600" />} label="Sản phẩm" value={stats?.totalProducts || 0} bgColor="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART BIỂU ĐỒ */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-50">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 size={18} className="text-red-600" />
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-700">Biểu đồ tăng trưởng năm {filters.year}</h4>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} 
                  tickFormatter={(v) => `TH ${v}`} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}} 
                  formatter={(value) => [`${Number(value).toLocaleString()}đ`, "Doanh thu"]}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={35}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.month === (new Date().getMonth() + 1) ? '#dc2626' : '#fecaca'} 
                      className="hover:fill-red-500 transition-colors duration-300"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP PRODUCTS LIST */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-50">
          <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-700">Sản phẩm bán chạy</h4>
          <div className="space-y-4">
            {stats?.topProducts?.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-red-400">RANK #0{i+1}</span>
                  <span className="text-xs font-bold text-gray-700 truncate max-w-[130px]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-lg">{item.totalSold} SP</span>
                </div>
              </div>
            ))}
            {stats?.topProducts?.length === 0 && (
              <div className="text-center py-10 text-gray-300 text-[10px] font-black uppercase italic">
                Chưa có dữ liệu giao dịch
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component con cho Card thống kê
const StatCard = ({ icon, label, value, bgColor }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-gray-200/30 border border-gray-100 hover:translate-y-[-4px] transition-all duration-300">
    <div className={`${bgColor} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-2xl font-black text-gray-900 tracking-tighter mt-1">{value}</h4>
  </div>
);

export default StatsSection;