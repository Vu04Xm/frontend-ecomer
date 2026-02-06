// import React, { useEffect, useState } from 'react';
// import axiosClient from '../api/axiosClient';

// const OrderHistory = () => {
//   const [orders, setOrders] = useState([]);
//   const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin user

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await axiosClient.get(`/orders/user/${user.id}`);
//         setOrders(res.data);
//       } catch (err) {
//         console.error("Lỗi lấy lịch sử đơn hàng:", err);
//       }
//     };
//     if (user) fetchOrders();
//   }, [user.id]);

//   return (
//     <div className="container mt-4">
//       <h2>Lịch sử đơn hàng của bạn</h2>
//       <table className="table table-bordered mt-3">
//         <thead>
//           <tr>
//             <th>Mã đơn hàng</th>
//             <th>Ngày đặt</th>
//             <th>Tổng tiền</th>
//             <th>Trạng thái</th>
//             <th>Địa chỉ nhận hàng</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order.order_id}>
//               <td>#{order.order_id}</td>
//               <td>{new Date(order.created_at).toLocaleString()}</td>
//               <td>{Number(order.total_amount).toLocaleString()}đ</td>
//               <td>
//                 <span className={`badge ${order.status === 'Pending' ? 'bg-warning' : 'bg-success'}`}>
//                   {order.status}
//                 </span>
//               </td>
//               <td>{order.shipping_address}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default OrderHistory;