import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage.jsx';
import Home from './pages/Home/Home';
import RegisterPage from './pages/Regist/RegisterPage.jsx';
import CartPage from './pages/cart/CartPage.jsx';
import Profile from './pages/profile/Profile';
import ProductDetail from './pages/product/Product';

// --- ADMIN COMPONENTS ---
import AdminLayout from './pages/admin/AdminLayout';
import StatsSection from './pages/admin/StatsSection';
import ProductPage from './pages/admin/ProductPage';
import UserPage from './pages/admin/UserPage';   
import CategoryPage from './pages/admin/CategoryPage'; 
import BrandPage from './pages/admin/BrandPage';
import PromotionPage from './pages/admin/PromotionPage';  
import Profileadmin from './pages/admin/Profile';
import OrderPageAdmin from './pages/admin/OrderPageAdmin'; 

// --- STAFF COMPONENTS ---
import StaffLayout from './pages/Home/Staff/StaffLayout'; 
import StaffOrders from './pages/Home/Staff/StaffOrders'; 
// DÒNG NÀY QUAN TRỌNG: Bạn phải import nó vào đây
import StaffProfiles from './pages/Home/Staff/StaffProfiles';

// --- HÀM KIỂM TRA QUYỀN (GUARDS) ---
const getUser = () => JSON.parse(localStorage.getItem("user"));

const AdminRoute = ({ children }) => {
  const user = getUser();
  return (user && Number(user.role_id) === 1) ? children : <Navigate to="/" replace />;
};

const StaffRoute = ({ children }) => {
  const user = getUser();
  const hasAccess = user && (Number(user.role_id) === 2 || Number(user.role_id) === 1);
  return hasAccess ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />       
        <Route path="/login" element={<LoginPage />} />      
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* ================= STAFF ROUTES (QUY TRÌNH) ================= */}
        <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<StaffOrders />} />
          
          {/* DÒNG NÀY FIX LỖI 404: Thêm route cho trang cá nhân nhân viên */}
          <Route path="profile" element={<StaffProfiles />} />
        </Route>

        {/* ================= ADMIN ROUTES (QUẢN TRỊ TOÀN DIỆN) ================= */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<StatsSection />} /> 
          <Route path="products" element={<ProductPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="brands" element={<BrandPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="orders" element={<OrderPageAdmin />} /> 
          <Route path="promotions" element={<PromotionPage />} />
          <Route path="profile" element={<Profileadmin />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;