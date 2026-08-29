import axios from 'axios';
import constants from '../constants';

const CART_API = axios.create({
  baseURL: `${constants.HOST}/cart`,
});

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const fetchCart = (userId) =>
  CART_API.get(`/${userId}`, authHeaders());

export const addToCart = (userId, productId, quantity = 1) =>
  CART_API.post(`/${userId}`, { productId, quantity }, authHeaders());

export const updateCartQuantity = (userId, productId, quantity) =>
  CART_API.patch(
    `/${userId}/${productId}`,
    { quantity },
    authHeaders()
  );

export const removeFromCart = (userId, productId) =>
  CART_API.delete(`/${userId}/${productId}`, authHeaders());