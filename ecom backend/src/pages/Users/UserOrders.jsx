// src/pages/auth/users/UserOrders.jsx 
import React, { useState, useEffect } from 'react';
import { 
  CircularProgress, IconButton, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogContent, DialogTitle
} from '@mui/material';
import { Close, Visibility, LocalShipping, ErrorOutline } from '@mui/icons-material';
import Api from '../../Services/Api';

const UserOrders = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);

  // Single API call to fetch all orders with details
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await Api.get(`/orders/users/${userId}/orders`);
        setOrders(response.data);
        console.log('Fetched orders:', response.data);
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Calculate order total
  const calculateOrderTotal = (order) => {
    console.log('Calculating total for order:', order);
    
    return order.items.reduce((total, item) => {
      const price = item.productId?.discountPrice || item.productId?.originalPrice || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
      </div>
      
      {error ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <ErrorOutline className="text-4xl mb-4" />
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress className="text-purple-600" />
        </div>
      ) : orders.length > 0 ? (
        <div className="flex-grow">
          <TableContainer className="max-h-[500px]">
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Order ID</TableCell>
                  <TableCell className="font-semibold">Date</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order._id} hover>
                    <TableCell className="font-medium text-purple-700">
                      #{order._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      ${calculateOrderTotal(order).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-purple-700 hover:text-purple-900"
                      >
                        <Visibility fontSize="small" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <LocalShipping className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        maxWidth="md"
        fullWidth
        PaperProps={{ className: 'rounded-xl' }}
      >
        {selectedOrder && (
          <>
            <DialogTitle className="flex justify-between items-center bg-purple-50">
              <h3 className="text-lg font-bold text-purple-800">
                Order #{selectedOrder._id.slice(-6).toUpperCase()}
              </h3>
              <IconButton onClick={() => setSelectedOrder(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p>{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                      <p>{selectedOrder.shippingAddress.zip}, {selectedOrder.shippingAddress.country}</p>
                      <p className="mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          selectedOrder.status === 'delivered' ? 'text-green-600' :
                          selectedOrder.status === 'cancelled' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span>Date:</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span>Payment Method:</span>
                        <span className="capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span>Items:</span>
                        <span>{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Total:</span>
                        <span>${calculateOrderTotal(selectedOrder).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left">Product</th>
                          <th className="py-2 px-4 text-center">Quantity</th>
                          <th className="py-2 px-4 text-center">Price</th>
                          <th className="py-2 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => {
                          const unitPrice = item.productId?.discountPrice || item.productId?.originalPrice || 0;
                          console.log('Calculating unit price for item:', item);
                          console.log('Unit price:', unitPrice);
                          console.log('Item quantity:', item.quantity);
                          
                          const totalPrice = unitPrice * item.quantity;
                          
                          return (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  {item.productId?.images?.[0] ? (
                                    <img 
                                      src={item.productId.images[0]} 
                                      alt={item.productId.name} 
                                      className="w-10 h-10 object-cover rounded-md mr-3"
                                    />
                                  ) : (
                                    <div className="bg-gray-200 border-2 border-dashed rounded-md w-10 h-10 mr-3" />
                                  )}
                                  <div>
                                    <div className="font-medium">{item.productId?.name || 'Product'}</div>
                                    <div className="text-sm text-gray-500">
                                      {item.productId?.brand && `${item.productId.brand} • `}
                                      {item.productId?.subcategory || item.productId?.category}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">{item.quantity}</td>
                              <td className="py-3 px-4 text-center">
                                {item.productId?.discountPrice ? (
                                  <>
                                    <span className="text-gray-500 line-through mr-2">
                                      ${item.productId?.originalPrice?.toFixed(2)}
                                    </span>
                                    <span className="text-red-600">
                                      ${item.productId?.discountPrice.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span>${unitPrice.toFixed(2)}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">
                                ${totalPrice.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default UserOrders;