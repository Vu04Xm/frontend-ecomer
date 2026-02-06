import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [couponInput, setCouponInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const user = useMemo(() => JSON.parse(localStorage.getItem('user')) || {}, []);
  const [customerName, setCustomerName] = useState(user.full_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const res = await axiosClient.get(`/cart/${user.id}`);
      setCartItems(res.data);
    } catch (err) {
      toast.error("Lỗi lấy dữ liệu giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    setIsApplying(true);
    try {
      const res = await axiosClient.post('/check-voucher', { code: couponInput });
      if (res.data.success) {
        setDiscountPercent(res.data.discount_percent);
        setAppliedCoupon(couponInput.toUpperCase());
        toast.success(`Áp dụng thành công: ${res.data.title}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ");
      setDiscountPercent(0);
      setAppliedCoupon(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleUpdateQuantity = async (cartId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await axiosClient.put(`/cart/${cartId}`, { quantity: newQty });
      fetchCart();
      setDiscountPercent(0);
      setAppliedCoupon(null);
    } catch (err) {
      toast.error("Lỗi cập nhật");
    }
  };

  const handleRemove = async (cartId) => {
    if (window.confirm("Xóa sản phẩm khỏi giỏ?")) {
      try {
        await axiosClient.delete(`/cart/${cartId}`);
        setCartItems(prev => prev.filter(item => item.cart_id !== cartId));
        setDiscountPercent(0);
        setAppliedCoupon(null);
        toast.success("Đã xóa");
      } catch (err) {
        toast.error("Lỗi xóa");
      }
    }
  };

  const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subTotal * discountPercent) / 100;
  const finalTotal = subTotal - discountAmount;

  // --- PHẦN SỬA ĐỔI QUAN TRỌNG NHẤT ---
  const handleCheckout = async () => {
    if (!customerName || !phone || !address) {
      toast.error("Vui lòng điền đủ thông tin!");
      return;
    }

    // Chuẩn bị mảng items để gửi lên Backend lưu vào orderdetails
    const itemsForBackend = cartItems.map(item => ({
        id: item.product_id, // Đảm bảo lấy đúng product_id từ giỏ hàng
        cartQuantity: item.quantity,
        price: item.price
    }));

    const orderData = { 
        userId: user.id, 
        totalAmount: finalTotal, 
        paymentMethod, 
        address, 
        customerName, 
        phone,
        appliedCoupon,
        items: itemsForBackend // <--- PHẢI CÓ DÒNG NÀY
    };

    const load = toast.loading("Đang xử lý đơn hàng...");
    try {
      const response = await axiosClient.post('/orders', orderData);
      console.log("Kết quả đặt hàng:", response.data);
      
      toast.success("Đặt hàng thành công!", { id: load });
      
      // Xóa state giỏ hàng cục bộ và về trang chủ
      setCartItems([]);
      navigate('/');
    } catch (err) {
      console.error("Lỗi Checkout:", err);
      toast.error(err.response?.data?.error || "Đặt hàng thất bại", { id: load });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center italic text-gray-400">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans pb-10 text-gray-800">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center mb-8 border-b pb-4">
          <button onClick={() => navigate('/')} className="text-gray-500 font-bold text-sm hover:text-red-600 mr-4 transition-colors">
              ❮ TIẾP TỤC MUA SẮM
          </button>
          <h1 className="text-xl font-black uppercase tracking-tight">Giỏ hàng ({cartItems.length})</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-gray-100">
            <img src="https://cdn2.cellphones.com.vn/x,webp,q100/media/cart/EmptyCart.png" className="w-40 mx-auto mb-6" alt="empty" />
            <p className="text-gray-400 font-medium mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <button onClick={() => navigate('/')} className="bg-[#d70018] text-white px-12 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-lg shadow-red-200 uppercase">Mua ngay</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b font-bold text-gray-700 bg-gray-50 text-xs uppercase italic tracking-wider">Danh sách sản phẩm</div>
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.cart_id} className="flex p-5 items-center bg-white hover:bg-gray-50/50 transition-colors">
                      <img src={item.product_image} className="w-20 h-20 object-contain rounded-xl border p-1 bg-white" alt="img" />
                      <div className="flex-1 ml-6">
                        <h3 className="text-sm font-bold mb-1 leading-tight">{item.name}</h3>
                        <p className="text-[#d70018] font-black text-base">{Number(item.price).toLocaleString()}đ</p>
                        <div className="flex items-center mt-3 border w-fit rounded-xl bg-white shadow-sm overflow-hidden">
                          <button onClick={() => handleUpdateQuantity(item.cart_id, item.quantity, -1)} className="w-8 h-8 font-bold text-gray-400 hover:bg-gray-100 transition-colors"> - </button>
                          <span className="px-4 text-xs font-black">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.cart_id, item.quantity, 1)} className="w-8 h-8 font-bold text-gray-400 hover:bg-gray-100 transition-colors"> + </button>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(item.cart_id)} className="text-gray-300 hover:text-red-500 p-2 ml-4 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-sm font-black mb-6 flex items-center uppercase italic border-l-4 border-[#d70018] pl-3">Thông tin nhận hàng</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Họ và tên" className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm outline-none focus:border-[#d70018] focus:bg-white transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    <input type="text" placeholder="Số điện thoại" className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm outline-none focus:border-[#d70018] focus:bg-white transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <input type="text" placeholder="Địa chỉ nhận hàng" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm outline-none focus:border-[#d70018] focus:bg-white transition-all" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-sm font-black mb-5 uppercase italic">Hình thức thanh toán</h2>
                <div className="grid grid-cols-1 gap-3">
                  {['COD', 'BANK'].map(method => (
                    <label key={method} className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === method ? 'border-[#d70018] bg-red-50/50 shadow-sm' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="accent-[#d70018] w-4 h-4" />
                      <span className="ml-4 text-sm font-bold">{method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản qua mã QR'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest italic">Mã giảm giá</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Nhập mã ưu đãi..." className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm outline-none focus:border-gray-300 transition-all uppercase font-bold" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} disabled={appliedCoupon} />
                  <button onClick={handleApplyCoupon} disabled={isApplying || appliedCoupon} className={`px-4 rounded-xl font-bold text-[10px] transition-all ${appliedCoupon ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-black'}`}>
                    {isApplying ? '...' : appliedCoupon ? '✓ DÙNG' : 'ÁP DỤNG'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-5 border-b bg-gray-50/50">
                  <h2 className="text-sm font-black uppercase tracking-widest italic">Tóm tắt đơn hàng</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Tạm tính:</span>
                    <span className="font-bold">{subTotal.toLocaleString()}₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Giảm giá:</span>
                      <span className="text-green-600 font-bold">- {discountAmount.toLocaleString()}₫</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-end mb-6">
                      <span className="font-black text-sm uppercase">Tổng tiền:</span>
                      <span className="text-[#d70018] font-black text-2xl tracking-tighter leading-none">{finalTotal.toLocaleString()}₫</span>
                    </div>
                    <button onClick={handleCheckout} className="w-full bg-[#d70018] text-white py-4 rounded-2xl font-black uppercase text-base shadow-xl shadow-red-200 hover:brightness-110 active:scale-95 transition-all">
                      Xác nhận đặt hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;