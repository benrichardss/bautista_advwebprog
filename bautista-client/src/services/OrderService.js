import axios from 'axios';
import constants from '../constants';

const ORDER_API = axios.create({
  baseURL: `${constants.HOST}/order`,
});

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const checkoutCart = (userId, orderDetails) =>
  ORDER_API.post(`/${userId}`, orderDetails, authHeaders());

export const fetchMyOrders = (userId) =>
  ORDER_API.get(`/user/${userId}`, authHeaders());

export const fetchAllOrders = (params = {}) =>
  ORDER_API.get('/', { params });

export const fetchOrderById = (orderId) =>
  ORDER_API.get(`/${orderId}`, authHeaders());

export const fetchDashboardOrders = (role, sellerId, params = {}) =>
  ORDER_API.get('/dashboard', {
    params: {
      ...params,
      role,
      sellerId: role === 'seller' ? sellerId : undefined,
    },
    ...authHeaders(),
  });

export const updateOrderStatus = (orderId, orderStatus) =>
  ORDER_API.patch(
    `/${orderId}`,
    { orderStatus },
    authHeaders()
  );

export const cancelOrder = (orderId) =>
  ORDER_API.delete(`/${orderId}`, authHeaders());