const StatsSection = () => {
  const stats = [
    { label: 'Sản phẩm', value: '128', color: 'text-gray-800' },
    { label: 'Đơn hàng', value: '56', color: 'text-gray-800' },
    { label: 'Khách hàng', value: '320', color: 'text-gray-800' },
    { label: 'Doanh thu', value: '120.000.000đ', color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;