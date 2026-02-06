import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  // Đã thêm mục 'Thông tin cá nhân' vào danh sách
  const menuItems = [
    { name: 'Thống kê', path: '/admin', icon: '📊' },
    { name: 'Danh mục', path: '/admin/categories', icon: '📁' },
    { name: 'Nhãn hàng', path: '/admin/brands', icon: '🏷️' },
    { name: 'Sản phẩm', path: '/admin/products', icon: '📱' },
    { name: 'Khuyến mãi', path: '/admin/promotions', icon: '🎁' },
    { name: 'Tài khoản', path: '/admin/users', icon: '👥' },
    { name: 'Đơn hàng', path: '/admin/orders', icon: '🛒' },
    { name: 'Cá nhân', path: '/admin/profile', icon: '👤' }, // Mục mới thêm

  ];

  return (
    <aside className="w-72 bg-[#d70018] text-white h-screen sticky top-0 shadow-[10px_0_30px_rgba(0,0,0,0.1)] flex flex-col overflow-y-auto overflow-x-hidden border-r border-white/10">
      
      {/* Logo Thương hiệu - Thiết kế mềm mại */}
      <div className="p-8 mb-4 flex-shrink-0">
        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/20 text-center shadow-lg">
          <span className="text-xl font-black uppercase tracking-[0.15em] block">CellphoneS</span>
          <span className="text-[10px] font-bold opacity-70 tracking-[0.3em] ml-1">ADMIN CENTER</span>
        </div>
      </div>

      {/* Danh sách Menu */}
      <nav className="flex-1 px-5 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'} 
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                isActive 
                  ? 'bg-white text-[#d70018] shadow-[0_10px_20px_rgba(0,0,0,0.15)] scale-[1.02] font-black' 
                  : 'hover:bg-white/10 opacity-80 hover:opacity-100 hover:translate-x-1'
              }`
            }
          >
            {/* Icon hiệu ứng nhẹ */}
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </span>
            
            <span className="text-[13px] font-bold uppercase tracking-wider">
              {item.name}
            </span>

            {/* Indicator cho mục đang chọn */}
            {({ isActive }) => isActive && (
              <div className="ml-auto w-2 h-2 bg-[#d70018] rounded-full animate-pulse"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-8 flex-shrink-0">
        <div className="bg-black/10 rounded-[1.5rem] py-4 px-2 text-center border border-white/5">
           <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">Hệ thống quản trị</p>
           <p className="text-[10px] font-medium opacity-50">© 2026 CellphoneS Dev</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;