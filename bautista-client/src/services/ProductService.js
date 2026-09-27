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

const createProductFormData = (product, imageFile) => {
  const formData = new FormData();

  Object.entries(product).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (imageFile) {
    formData.append('image', imageFile);
  }

  return formData;
};

export const createProduct = (product, imageFile) =>
  PRODUCT_API.post('/', createProductFormData(product, imageFile), authHeaders());

export const updateProduct = (id, product, imageFile) =>
  PRODUCT_API.patch(
    `/${id}`,
    createProductFormData(product, imageFile),
    authHeaders()
  );

export const fetchCategories = () =>
  CATEGORY_API.get('/');