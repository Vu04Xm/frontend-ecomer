import { NavLink } from 'react-router-dom';

const StaffSidebar = () => {
  // 1. Cập nhật menu phù hợp với quyền hạn nhân viên
  const menuItems = [
    { name: 'Đơn hàng', path: '/staff/orders', icon: '📋' },
    { name: 'Cá nhân', path: '/staff/profile', icon: '👤' },
  ];

  return (
    <aside className="w-72 bg-[#d70018] text-white h-screen sticky top-0 shadow-[10px_0_30px_rgba(0,0,0,0.1)] flex flex-col overflow-y-auto overflow-x-hidden border-r border-white/10">
      
      {/* 2. Cập nhật Logo & Role hiệu */}
      <div className="p-8 mb-4 flex-shrink-0">
        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/20 text-center shadow-lg">
          <span className="text-xl font-black uppercase tracking-[0.15em] block">CellphoneS</span>
          <span className="text-[10px] font-bold text-red-200 tracking-[0.3em] ml-1 uppercase">Staff Portal</span>
        </div>
      </div>

      {/* Danh sách Menu */}
      <nav className="flex-1 px-5 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // Logic end={true} nếu path là trang chủ của staff
            end={item.path === '/staff'} 
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                isActive 
                  ? 'bg-white text-[#d70018] shadow-[0_10px_20px_rgba(0,0,0,0.15)] scale-[1.02] font-black' 
                  : 'hover:bg-white/10 opacity-80 hover:opacity-100 hover:translate-x-1'
              }`
            }
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </span>
            
            <span className="text-[13px] font-bold uppercase tracking-wider">
              {item.name}
            </span>

            {({ isActive }) => isActive && (
              <div className="ml-auto w-2 h-2 bg-[#d70018] rounded-full animate-pulse"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. Cập nhật Footer Footer Sidebar */}
      <div className="p-8 flex-shrink-0">
        <div className="bg-black/10 rounded-[1.5rem] py-4 px-2 text-center border border-white/5">
           <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">Cổng thông tin nhân viên</p>
           <p className="text-[10px] font-medium opacity-50 italic">Hỗ trợ khách hàng tốt nhất</p>
        </div>
      </div>
    </aside>
  );
};

export default StaffSidebar;