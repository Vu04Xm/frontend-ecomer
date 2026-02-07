import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import ReactMarkdown from "react-markdown";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- LẤY THÔNG TIN USER TỪ LOCALSTORAGE ---
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- LOGIC CHẶN ADMIN/STAFF TRUY CẬP HOME ---
  useEffect(() => {
    if (user) {
      const roleId = Number(user.role_id);
      if (roleId === 1) {
        // Nếu là Admin, điều hướng ngay lập tức về trang quản trị
        navigate("/admin", { replace: true });
      } else if (roleId === 2) {
        // Nếu là Staff, điều hướng về trang đơn hàng
        navigate("/staff/orders", { replace: true });
      }
    }
  }, [user, navigate]);

  // --- LOGIC CHAT BOX AI ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Chào bạn! Mình là trợ lý Cellphones AI. Mình có thể giúp gì cho bạn ạ? 😊" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "https://cellphones-backend.onrender.com/api";
      const response = await fetch(`${baseUrl}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });
      
      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      console.error("Lỗi Chat AI:", error);
      setChatMessages((prev) => [...prev, { role: "ai", text: "Xin lỗi, kết nối của mình bị gián đoạn. Thử lại sau nhé!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- STATE TÌM KIẾM & LỌC ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProducts, resCategories, resBrands] = await Promise.all([
          axiosClient.get("/products"),
          axiosClient.get("/categories"),
          axiosClient.get("/brands"),
        ]);
        setProducts(resProducts.data);
        setCategories(resCategories.data);
        setBrands(resBrands.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOGIC LỌC SẢN PHẨM ---
  const filteredProducts = products.filter((product) => {
    const productName = product.name ? product.name.toLowerCase() : "";
    const search = searchTerm.toLowerCase();
    const matchesSearch = productName.includes(search);
    const matchesBrand = selectedBrandId ? product.brand_id === selectedBrandId : true;
    const matchesCategory = selectedCategoryId ? product.category_id === selectedCategoryId : true;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    setSelectedBrandId(null);
    setSearchTerm("");
    setShowCategoryMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const handleUserClick = () => {
    const roleId = user?.role_id ? Number(user.role_id) : null;
    if (roleId === 1) navigate("/admin");
    else if (roleId === 2) navigate("/staff/orders");
    else navigate("/profile");
  };

  const getBrandTheme = (name) => {
    const brandName = name ? name.trim().toLowerCase() : "";
    const themes = {
      apple: { hex: "#555555", rgb: "85, 85, 85" },
      samsung: { hex: "#034EA2", rgb: "3, 78, 162" },
      xiaomi: { hex: "#FF6700", rgb: "255, 103, 0" },
      asus: { hex: "#00539B", rgb: "0, 83, 155" },
    };
    return themes[brandName] || { hex: "#e0e0e0", rgb: "224, 224, 224" };
  };

  const getCategoryIcon = (name) => {
    if (name.includes("thoại")) return "📱 ";
    if (name.includes("Laptop")) return "💻 ";
    if (name.includes("Âm thanh") || name.includes("Loa") || name.includes("Tai nghe")) return "🎧 ";
    if (name.includes("Màn hình")) return "🖥️ ";
    if (name.includes("Phụ kiện") || name.includes("Sạc")) return "🔌 ";
    if (name.includes("Đồng hồ")) return "⌚ ";
    return "📦 ";
  };

  // NẾU LÀ ADMIN HOẶC STAFF, KHÔNG HIỂN THỊ GIAO DIỆN HOME
  if (user && (Number(user.role_id) === 1 || Number(user.role_id) === 2)) {
    return null; 
  }

  return (
    <div className="home">
      {/* HEADER */}
      <header className="header">
        <div className="container header-inner">
          <img
            src="https://cdn2.cellphones.com.vn/x/media/wysiwyg/Web/logo_CPS_tet_2026.gif"
            alt="Logo"
            className="logo"
            onClick={() => {
              navigate("/");
              setSelectedCategoryId(null);
              setSelectedBrandId(null);
              setSearchTerm("");
            }}
          />

          <div className="category-wrapper">
            <div className="category-btn" onClick={() => setShowCategoryMenu(!showCategoryMenu)}>
              <div className="category-icon">
                <span></span><span></span><span></span><span></span>
              </div>
              <span>Danh mục</span>
              <i className={`arrow-down ${showCategoryMenu ? "rotate" : ""}`}></i>
            </div>

            {showCategoryMenu && (
              <div className="category-dropdown-container">
                <ul className="category-dropdown-list">
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      className={`category-item ${selectedCategoryId === cat.id ? "active" : ""}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <span className="cat-name">{getCategoryIcon(cat.name)}{cat.name}</span>
                      <span className="cat-arrow">›</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="search">
            <input
              type="text"
              placeholder="Bạn muốn mua gì hôm nay?"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedBrandId(null);
                setSelectedCategoryId(null);
              }}
              style={{ color: "#333" }}
            />
            <button>🔍</button>
          </div>

          <div className="actions">
            <Link to="/cart" className="header-link">🛒 Giỏ hàng</Link>
            {user ? (
              <span className="header-link user-name-nav" onClick={handleUserClick} style={{ cursor: "pointer" }}>
                Hi, {user.full_name || user.name}
              </span>
            ) : (
              <Link to="/login" className="header-link">👤 Đăng nhập</Link>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        <div className="container content-inner">
          <aside className="menu">
            {categories.slice(0, 10).map((cat) => (
              <p
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={selectedCategoryId === cat.id ? "active-category" : ""}
              >
                {getCategoryIcon(cat.name)} {cat.name}
              </p>
            ))}
          </aside>

          <section className="banner-container">
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="home-swiper"
              >
                {products.slice(0, 5).map((product) => (
                  <SwiperSlide key={product.id}>
                    <div className="swiper-item-wrapper" onClick={() => navigate(`/product/${product.id}`)}>
                      <div className="banner-main-img">
                        <img src={product.product_image} alt={product.name} className="swiper-img" />
                      </div>
                      <div className="banner-footer">
                        <div className="footer-info-item">
                          <span className="label">Giá chỉ từ</span>
                          <span className="value">{product.price?.toLocaleString()}đ</span>
                        </div>
                        <div className="footer-info-item separator">
                          <span className="label">Trả góp 0%</span>
                          <span className="value">12 Tháng</span>
                        </div>
                        <div className="footer-info-item">
                          <span className="label">S-Member giảm thêm</span>
                          <span className="value">300K</span>
                        </div>
                        <button className="btn-buy-now">Mua ngay</button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>

          <aside className="user-box">
            {user ? (
              <div className="user-info-side" onClick={handleUserClick} style={{ cursor: "pointer" }}>
                <div className="user-avatar-circle"><span>👤</span></div>
                <p className="welcome-text">Xin chào,</p>
                <p className="user-name-text" style={{ fontWeight: "bold", color: "#d70018" }}>
                  {user.full_name || user.name}
                </p>
                <button className="btn-logout-side" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="user-guest-side">
                <p>Xin chào 👋</p>
                <button className="btn-login-aside" onClick={() => navigate("/login")}>Đăng nhập</button>
              </div>
            )}
          </aside>
        </div>

        {/* THƯƠNG HIỆU */}
        <div className="container">
          <section className="brand-bar">
            <h3 className="brand-title">THƯƠNG HIỆU HỢP TÁC</h3>
            <div className="brand-list">
              <div
                className={`brand-item ${selectedBrandId === null ? "active" : ""}`}
                onClick={() => { setSelectedBrandId(null); setSearchTerm(""); }}
                style={{ "--brand-color": "#d70018", "--brand-rgb": "215, 0, 24" }}
              >
                <span>Tất cả</span>
              </div>
              {brands.map((brand) => {
                const theme = getBrandTheme(brand.name);
                return (
                  <div
                    key={brand.id}
                    className={`brand-item ${selectedBrandId === brand.id ? "active" : ""}`}
                    onClick={() => { setSelectedBrandId(brand.id); setSearchTerm(""); }}
                    style={{ "--brand-color": theme.hex, "--brand-rgb": theme.rgb }}
                  >
                    {brand.brand_image ? (
                      <img src={brand.brand_image} alt={brand.name} className="brand-logo-img" />
                    ) : (
                      <span>{brand.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* LƯỚI SẢN PHẨM */}
        <div className="container">
          <section className="product-section">
            <div className="section-header">
              <h2>
                {selectedCategoryId ? `DANH MỤC: ${categories.find(c => c.id === selectedCategoryId)?.name}` :
                 selectedBrandId ? `THƯƠNG HIỆU: ${brands.find(b => b.id === selectedBrandId)?.name}` :
                 searchTerm ? `KẾT QUẢ CHO: "${searchTerm}"` : "SẢN PHẨM NỔI BẬT"}
              </h2>
            </div>
            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div className="product-card" key={product.id} onClick={() => navigate(`/product/${product.id}`)}>
                    <div className="product-img-box"><img src={product.product_image} alt={product.name} /></div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="price-row">
                        <span className="current-price">{product.price?.toLocaleString()}đ</span>
                        <span className="old-price">{(product.price * 1.1).toLocaleString()}đ</span>
                      </div>
                      <div className="promo-tag">S-member giảm thêm đến 300k</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-result" style={{ textAlign: "center", width: "100%", padding: "40px" }}>
                  <p>Không tìm thấy sản phẩm phù hợp.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* --- GIAO DIỆN CHAT BOX AI --- */}
      <div className="ai-chat-widget">
        <div className="ai-chat-bubble" onClick={() => setIsChatOpen(!isChatOpen)}>
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI" />
            {!isChatOpen && <div className="chat-tooltip">Hỏi Cellphones AI</div>}
        </div>

        {isChatOpen && (
          <div className="ai-chat-window">
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <div className="ai-status-dot"></div>
                <span>Trợ lý ảo Cellphones</span>
              </div>
              <button className="ai-close-btn" onClick={() => setIsChatOpen(false)}>✕</button>
            </div>

            <div className="ai-chat-body">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-message-row ${msg.role === "user" ? "user" : "ai"}`}>
                  <div className="ai-message-bubble">
                    {msg.role === "ai" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="ai-message-row ai">
                  <div className="ai-message-bubble typing">Đang gõ...</div>
                </div>
              )}
              <div ref={chatScrollRef} />
            </div>

            <div className="ai-chat-footer">
              <input
                type="text"
                placeholder="Hỏi giá, cấu hình..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ai-chat-widget { position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Arial', sans-serif; }
        .ai-chat-bubble { width: 60px; height: 60px; background: #d70018; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s; position: relative; }
        .ai-chat-bubble:hover { transform: scale(1.1); }
        .ai-chat-bubble img { width: 35px; height: 35px; filter: brightness(0) invert(1); }
        .chat-tooltip { position: absolute; right: 70px; background: #333; color: white; padding: 5px 12px; border-radius: 5px; font-size: 13px; white-space: nowrap; opacity: 0.9; }
        
        .ai-chat-window { position: absolute; bottom: 75px; right: 0; width: 350px; height: 450px; background: white; border-radius: 15px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 1px solid #eee; }
        .ai-chat-header { background: #d70018; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .ai-header-info { display: flex; align-items: center; gap: 8px; font-weight: bold; }
        .ai-status-dot { width: 8px; height: 8px; background: #45ea45; border-radius: 50%; }
        .ai-close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }
        
        .ai-chat-body { flex: 1; padding: 15px; overflow-y: auto; background: #f9f9f9; display: flex; flex-direction: column; gap: 10px; }
        .ai-message-row { display: flex; width: 100%; }
        .ai-message-row.user { justify-content: flex-end; }
        .ai-message-row.ai { justify-content: flex-start; }
        
        .ai-message-bubble { max-width: 85%; padding: 10px 14px; border-radius: 15px; font-size: 14px; line-height: 1.5; }
        .ai-message-row.user .ai-message-bubble { background: #d70018; color: white; border-bottom-right-radius: 2px; }
        .ai-message-row.ai .ai-message-bubble { background: #eee; color: #333; border-bottom-left-radius: 2px; }

        .ai-message-bubble p { margin: 0 0 8px 0; }
        .ai-message-bubble p:last-child { margin-bottom: 0; }
        .ai-message-bubble ul { margin: 5px 0; padding-left: 20px; }
        .ai-message-bubble li { margin-bottom: 4px; }
        .ai-message-bubble strong { font-weight: 700; color: inherit; }

        .ai-message-bubble.typing { color: #888; font-style: italic; background: none; }
        
        .ai-chat-footer { padding: 10px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
        .ai-chat-footer input { flex: 1; border: 1px solid #ddd; padding: 8px 12px; border-radius: 20px; outline: none; font-size: 14px; }
        .ai-chat-footer button { background: #d70018; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
      `}</style>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3 className="footer-title">Tổng đài hỗ trợ miễn phí</h3>
              <ul className="footer-list">
                <li>Gọi mua hàng: <a href="tel:18002097"><strong>1800.2097</strong></a> (7h30 - 22h00)</li>
                <li>Khiếu nại: <a href="tel:18002063"><strong>1800.2063</strong></a> (8h00 - 21h30)</li>
                <li>Bảo hành: <a href="tel:18002064"><strong>1800.2064</strong></a> (8h00 - 21h00)</li>
              </ul>
              <h3 className="footer-title mt-20">Phương thức thanh toán</h3>
              <div className="payment-methods">
                <img src="https://cellphones.com.vn/media/wysiwyg/apple-pay-og.png" alt="Apple Pay" />
                <img src="https://cellphones.com.vn/media/logo/payment/vnpay-logo.png" alt="VNPAY" />
                <img src="https://cellphones.com.vn/media/logo/payment/momo_icon.png" alt="Momo" />
              </div>
            </div>

            <div className="footer-col">
              <h3 className="footer-title">Thông tin và chính sách</h3>
              <ul className="footer-list">
                <li><a href="#">Mua hàng và thanh toán Online</a></li>
                <li><a href="#">Chính sách giao hàng</a></li>
                <li><a href="#">Tra thông tin bảo hành</a></li>
                <li><a href="#">Chính sách bảo mật</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-title">Dịch vụ và thông tin khác</h3>
              <ul className="footer-list">
                <li><a href="#">Khách hàng doanh nghiệp (B2B)</a></li>
                <li><a href="#">Ưu đãi thanh toán</a></li>
                <li><a href="#">Quy chế hoạt động</a></li>
                <li><a href="#">Tuyển dụng</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-title">Kết nối với chúng tôi</h3>
              <div className="social-group">
                <a href="#" className="social-icon fb"></a>
                <a href="#" className="social-icon yt"></a>
                <a href="#" className="social-icon zl"></a>
              </div>
              <div className="certification mt-20">
                <img src="https://cellphones.com.vn/media/logo/logoSaleNoti.png" alt="Bộ công thương" className="bct-img" />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <p>© 2026. Công ty TNHH Thương mại và Dịch vụ Kỹ thuật CellphoneS. GPDKKD: 0123456789 do Sở KH&ĐT TP.HCM cấp.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;