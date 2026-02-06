import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast, { Toaster } from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/products/${id}`);
        setProduct(res.data);
        setActiveImg(res.data.product_image); // Đặt ảnh mặc định
      } catch (err) {
        console.error("Lỗi Fetch:", err);
        toast.error("Không thể tải thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async (isBuyNow = false) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      return setTimeout(() => navigate('/login'), 1500);
    }

    const toastId = toast.loading('Đang xử lý...');
    try {
      await axiosClient.post('/cart', {
        userId: user.id,
        productId: product.id,
        quantity: quantity
      });
      toast.success(`Đã thêm vào giỏ hàng!`, { id: toastId });
      if (isBuyNow) navigate('/cart');
    } catch (err) {
      toast.error("Lỗi thêm vào giỏ hàng!", { id: toastId });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen italic text-gray-500">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
      Đang tải...
    </div>
  );

  if (!product) return <div className="text-center py-20 font-bold">Sản phẩm không tồn tại!</div>;

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-10 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs mb-4 text-gray-500">
          <span className="cursor-pointer hover:text-red-600" onClick={() => navigate('/')}>Trang chủ</span>
          <span>›</span>
          <span className="font-semibold text-gray-800 uppercase">{product.name}</span>
        </nav>

        {/* Tiêu đề */}
        <div className="border-b border-gray-200 mb-5 pb-3">
          <h1 className="text-xl md:text-2xl font-bold text-[#333]">{product.name}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* --- CỘT TRÁI: HÌNH ẢNH & THUMBNAILS --- */}
            <div className="md:w-[45%]">
              <div className="border border-gray-100 rounded-2xl p-6 flex justify-center bg-white shadow-inner">
                <img 
                  src={activeImg || product.product_image || "https://via.placeholder.com/500"} 
                  alt={product.name}
                  className="max-h-[350px] object-contain transition-all duration-300"
                />
              </div>
              
              {/* Giữ nguyên danh sách ảnh nhỏ ở dưới */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item}
                    onClick={() => setActiveImg(product.product_image)}
                    className={`min-w-[70px] h-[70px] border-2 rounded-xl p-1 cursor-pointer transition-all ${activeImg === product.product_image ? 'border-red-600' : 'border-gray-100 hover:border-red-300'}`}
                  >
                    <img src={product.product_image} className="w-full h-full object-contain rounded-lg" alt="thumbnail" />
                  </div>
                ))}
              </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG TIN MUA HÀNG --- */}
            <div className="md:w-[55%]">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-[#d70018]">
                  {Number(product.price || 0).toLocaleString()}₫
                </span>
                {product.old_price && (
                  <span className="text-lg text-gray-400 line-through">
                    {Number(product.old_price).toLocaleString()}₫
                  </span>
                )}
              </div>

              {/* Khối Khuyến mãi CellphoneS */}
              <div className="border border-[#d70018] rounded-xl overflow-hidden mb-8 shadow-sm">
                <div className="bg-[#d70018] text-white px-4 py-2 flex items-center gap-2 font-bold text-sm uppercase">
                  <span>🎁</span> Khuyến mãi đặc biệt
                </div>
                <div className="p-4 text-sm leading-6 text-gray-700 space-y-3 bg-red-50/30">
                  <p className="flex items-start gap-2 italic">
                    <span className="text-red-600 font-bold">●</span> Thu cũ đổi mới - Trợ giá lên tới 2.000.000đ
                  </p>
                  <p className="flex items-start gap-2 italic">
                    <span className="text-red-600 font-bold">●</span> Giảm thêm 1% cho thành viên Smember
                  </p>
                </div>
              </div>

              {/* SỬA LỖI SỐ LƯỢNG: Đảm bảo bấm là nhảy số */}
              <div className="flex items-center gap-5 mb-8">
                <span className="font-bold text-gray-700 text-sm">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-11 bg-white shadow-sm">
                  <button 
                    type="button"
                    onClick={() => quantity > 1 && setQuantity(prev => prev - 1)}
                    className="w-12 h-full bg-gray-50 hover:bg-gray-200 text-gray-700 font-bold transition-all border-r active:bg-gray-300"
                  >
                    −
                  </button>
                  <input 
                    type="text" 
                    value={quantity} 
                    readOnly 
                    className="w-14 text-center text-base font-bold text-gray-900 focus:outline-none bg-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-12 h-full bg-gray-50 hover:bg-gray-200 text-gray-700 font-bold transition-all border-l active:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* HỆ THỐNG NÚT BẤM */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleAddToCart(true)}
                  className="w-full bg-[#d70018] hover:bg-[#b80014] text-white py-4 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md active:scale-[0.98]"
                >
                  <span className="font-extrabold text-base uppercase">MUA NGAY</span>
                  <span className="text-[11px] font-light">(Giao nhanh miễn phí hoặc nhận tại shop)</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAddToCart(false)}
                    className="border-2 border-[#d70018] text-[#d70018] py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-all active:scale-[0.98] text-sm uppercase"
                  >
                    <span>🛒</span> Thêm giỏ hàng
                  </button>
                  <button 
                    className="bg-[#288ad6] hover:bg-[#2070ae] text-white py-3 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-[0.98] text-sm uppercase"
                  >
                    <span>TRẢ GÓP 0%</span>
                    <span className="text-[10px] font-normal lowercase">(Qua thẻ hoặc công ty tài chính)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;