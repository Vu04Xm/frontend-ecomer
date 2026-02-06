// Ví dụ trong AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <header></header>
        {/* Nội dung các route con sẽ hiện ở đây */}
        <Outlet /> 
      </div>
    </div>
  );
};
export default AdminLayout;