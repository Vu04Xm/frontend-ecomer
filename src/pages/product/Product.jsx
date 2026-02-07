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
        setActiveImg(res.data.product_image); 
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

  // Hàm xử lý parse description và xóa dấu gạch chân "_"
  const renderSpecs = () => {
    try {
      if (!product.description) return <p className="text-gray-400 italic">Thông tin đang cập nhật...</p>;
      
      const specs = typeof product.description === 'string' 
        ? JSON.parse(product.description) 
        : product.description;

      return Object.entries(specs).map(([key, value], i) => {
        // Xóa dấu gạch chân, thay bằng khoảng trắng và viết hoa chữ đầu
        const cleanKey = key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

        return (
          <div key={i} className="flex justify-between py-4 border-b border-gray-100 hover:bg-gray-50 px-2 transition-colors">
            <span className="text-gray-500 font-medium">{cleanKey}</span>
            <span className="text-gray-800 font-bold text-right">{String(value)}</span>
          </div>
        );
      });
    } catch (e) {
      return (
        <div 
          className="text-gray-700 leading-relaxed prose max-w-none px-2"
          dangerouslySetInnerHTML={{ __html: product.description }} 
        />
      );
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
    <div className="bg-[#f4f4f4] min-h-screen pb-10 font-sans text-[#444]">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto px-4 pt-4 text-left">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs mb-4 text-gray-500 uppercase">
          <span className="cursor-pointer hover:text-red-600" onClick={() => navigate('/')}>Trang chủ</span>
          <span>›</span>
          <span className="font-semibold text-gray-800">{product.name}</span>
        </nav>

        {/* Tiêu đề */}
        <div className="border-b border-gray-200 mb-5 pb-3">
          <h1 className="text-xl md:text-2xl font-bold text-[#333] uppercase leading-tight">{product.name}</h1>
        </div>

        {/* --- KHỐI ẢNH & MUA HÀNG --- */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Cột trái: Ảnh */}
            <div className="md:w-[45%]">
              <div className="border border-gray-100 rounded-2xl p-6 flex justify-center bg-white shadow-inner">
                <img 
                  src={activeImg || product.product_image || "https://via.placeholder.com/500"} 
                  alt={product.name}
                  className="max-h-[350px] object-contain transition-all duration-300"
                />
              </div>
            </div>

            {/* Cột phải: Giá & Nút bấm */}
            <div className="md:w-[55%] text-left">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-[#d70018]">{Number(product.price || 0).toLocaleString()}₫</span>
                {product.old_price && <span className="text-lg text-gray-400 line-through">{Number(product.old_price).toLocaleString()}₫</span>}
              </div>

              <div className="border border-[#d70018] rounded-xl overflow-hidden mb-8 shadow-sm">
                <div className="bg-[#d70018] text-white px-4 py-2 font-bold text-sm uppercase">🎁 Khuyến mãi đặc biệt</div>
                <div className="p-4 text-sm space-y-2 bg-red-50/30 italic font-medium">
                  <p>● Thu cũ đổi mới - Trợ giá lên tới 2.000.000đ</p>
                  <p>● Giảm thêm 1% cho thành viên Smember</p>
                </div>
              </div>

              <div className="flex items-center gap-5 mb-8">
                <span className="font-bold text-sm text-gray-600">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden h-11 bg-white shadow-sm">
                  <button onClick={() => quantity > 1 && setQuantity(prev => prev - 1)} className="w-12 h-full bg-gray-50 hover:bg-gray-200 font-bold border-r transition-colors">-</button>
                  <input type="text" value={quantity} readOnly className="w-14 text-center font-bold focus:outline-none bg-white" />
                  <button onClick={() => setQuantity(prev => prev + 1)} className="w-12 h-full bg-gray-50 hover:bg-gray-200 font-bold border-l transition-colors">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => handleAddToCart(true)} className="w-full bg-[#d70018] hover:bg-[#b80014] text-white py-4 rounded-2xl font-extrabold shadow-md transition-all active:scale-[0.98]">MUA NGAY</button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleAddToCart(false)} className="border-2 border-[#d70018] text-[#d70018] py-3 rounded-xl font-bold hover:bg-red-50 transition-all">🛒 THÊM GIỎ HÀNG</button>
                  <button className="bg-[#288ad6] hover:bg-[#2070ae] text-white py-3 rounded-xl font-bold uppercase transition-all">Trả góp 0%</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- KHỐI THÔNG TIN CHI TIẾT (RENDER TỪ DATABASE) --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
          <h2 className="text-xl font-bold mb-8 text-[#333] flex items-center gap-3">
            <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
            THÔNG TIN CHI TIẾT SẢN PHẨM
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
            {renderSpecs()}
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center">
             <p className="text-gray-500 text-sm italic">Thông tin được trích xuất trực tiếp từ cơ sở dữ liệu hệ thống.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;