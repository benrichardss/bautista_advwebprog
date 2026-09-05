import axios from 'axios';
import constants from '../constants';

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const PRODUCT_API = axios.create({
  baseURL: `${constants.HOST}/product`,
});

const CATEGORY_API = axios.create({
  baseURL: `${constants.HOST}/category`,
});

export const fetchProducts = (params = {}) =>
  PRODUCT_API.get('/', { params });

export const fetchProductById = (id) =>
  PRODUCT_API.get(`/${id}`);

export const fetchProductsBySeller = (sellerId) =>
  PRODUCT_API.get(`/seller/${sellerId}`);

export const createProduct = (product) =>
  PRODUCT_API.post('/', product, authHeaders());

export const updateProduct = (id, product) =>
  PRODUCT_API.patch(`/${id}`, product, authHeaders());

export const fetchCategories = () =>
  CATEGORY_API.get('/');