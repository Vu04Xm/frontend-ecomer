import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient'; 
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setProfileData({
        full_name: parsedUser.full_name || '',
        phone: parsedUser.phone || ''
      });
    }
  }, [navigate]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    try {
      const res = await axiosClient.get(`/orders/user/${user.id}`);
      const sortedOrders = res.data.sort((a, b) => b.order_id - a.order_id);
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Lỗi lấy đơn hàng:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (['orders', 'history'].includes(activeTab) && user?.id) {
      fetchOrders();
    }
  }, [activeTab, user?.id]);

  // --- LOGIC HỦY ĐƠN ĐÃ LƯỢC BỎ LÝ DO ---
  const handleCancelOrder = async (orderId) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #OCPS${orderId}?`)) {
      try {
        await axiosClient.put(`/orders/${orderId}/status`, { 
          status: 'Cancelled' 
        });
        alert("Đã hủy đơn hàng thành công.");
        fetchOrders(); 
        setActiveTab('history'); 
      } catch (err) {
        alert("Lỗi hệ thống: Không thể hủy đơn.");
      }
    }
  };

  const handleUpdateInfo = async () => {
    try {
      await axiosClient.put(`/users/update-profile/${user.id}`, profileData);
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi cập nhật thông tin");
    }
  };

  const processingOrders = orders.filter(o => ['Pending', 'Confirmed', 'Shipping'].includes(o.status));
  const historyOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const renderOrderCard = (order) => (
    <div className="profile-order-card" key={order.order_id}>
      <div className="profile-order-header">
        <span className="profile-order-id">Mã đơn: #OCPS{order.order_id}</span>
        <div className="profile-order-header-right">
          <span className={`profile-order-status profile-status-${order.status.toLowerCase()}`}>
            {order.status === 'Delivered' ? '✅ Thành công' : order.status === 'Cancelled' ? '❌ Đã hủy' : order.status}
          </span>
          {(order.status === 'Pending' || order.status === 'Confirmed') && (
            <button className="profile-cancel-btn" onClick={() => handleCancelOrder(order.order_id)}>Hủy đơn</button>
          )}
        </div>
      </div>
      <div className="profile-order-body">
        <p><strong>Thời gian:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
        <p><strong></strong> {order.shipping_address}</p>
        <p className="profile-order-total">Tổng tiền: <span>{Number(order.total_amount).toLocaleString()}đ</span></p>
      </div>
    </div>
  );

  if (!user) return <div className="profile-loading">Đang tải...</div>;

  return (
    <div className="profile-page-wrapper">
      <header className="profile-header-nav">
        <div className="profile-header-inner">
          <div className="profile-logo-container" onClick={() => navigate('/')}>
            <img src="https://cdn.cellphones.com.vn/media/logo/gw2/logo.png" alt="Logo" className="profile-main-logo" />
          </div>
        </div>
      </header>

      <div className="profile-container-inner">
        <aside className="profile-sidebar">
          <div className="profile-user-brief">
            <div className="profile-brief-avatar">
              <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/147/147144.png"} alt="avatar" />
            </div>
            <div className="profile-brief-right">
              <p className="profile-brief-name">{user.full_name}</p>
              <p className="text-xs text-gray-400">Thành viên</p>
            </div>
          </div>

          <nav className="profile-nav-menu">
            <div className={`profile-menu-item ${activeTab === 'info' ? 'profile-active' : ''}`} onClick={() => setActiveTab('info')}>👤 Hồ sơ</div>
            <div className={`profile-menu-item ${activeTab === 'orders' ? 'profile-active' : ''}`} onClick={() => setActiveTab('orders')}>🚚 Đang chờ ({processingOrders.length})</div>
            <div className={`profile-menu-item ${activeTab === 'history' ? 'profile-active' : ''}`} onClick={() => setActiveTab('history')}>📜 Lịch sử đơn mua</div>
            <div className="profile-menu-item profile-logout" onClick={() => { localStorage.clear(); window.location.href = '/'; }}>🚪 Đăng xuất</div>
          </nav>
        </aside>

        <main className="profile-main-content">
          <div className="profile-main-inner-content">
            {activeTab === 'info' && (
              <div className="profile-tab-content">
                <h2 className="profile-tab-title">Thông tin tài khoản</h2>
                <hr className="profile-divider" />
                <div className="profile-info-form">
                  <div className="profile-form-group">
                    <label className="profile-label">Họ và tên</label>
                    <input className="profile-input" type="text" value={profileData.full_name} onChange={(e) => setProfileData({...profileData, full_name: e.target.value})} />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">Số điện thoại</label>
                    <input className="profile-input" type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                  </div>
                  <button className="profile-save-btn" onClick={handleUpdateInfo}>Lưu thay đổi</button>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="profile-tab-content">
                <h2 className="profile-tab-title">Đơn hàng đang chờ xử lý</h2>
                <hr className="profile-divider" />
                {loadingOrders ? <p>Đang tải...</p> : processingOrders.length === 0 ? <p className="profile-empty">Trống</p> : 
                  <div className="profile-order-list">{processingOrders.map(renderOrderCard)}</div>
                }
              </div>
            )}

            {activeTab === 'history' && (
              <div className="profile-tab-content">
                <h2 className="profile-tab-title">Lịch sử đơn mua</h2>
                <hr className="profile-divider" />
                {loadingOrders ? <p>Đang tải...</p> : historyOrders.length === 0 ? <p className="profile-empty">Trống</p> : 
                  <div className="profile-order-list">{historyOrders.map(renderOrderCard)}</div>
                }
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;