import axios from 'axios';
import constants from '../constants';

const REVIEW_API = axios.create({
  baseURL: `${constants.HOST}/review`,
});

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const fetchProductReviews = (productId) =>
  REVIEW_API.get(`/product/${productId}`);

export const createReview = (productId, review) =>
  REVIEW_API.post(`/product/${productId}`, review, authHeaders());

export const updateReview = (reviewId, review) =>
  REVIEW_API.put(`/${reviewId}`, review, authHeaders());

export const fetchMyReviews = (userId) =>
  REVIEW_API.get(`/reviewer/${userId}`, authHeaders());

export const fetchProductsToReview = (userId) =>
  REVIEW_API.get(`/reviewer/${userId}/to-review`, authHeaders());

export const fetchAllReviews = (params = {}) =>
  REVIEW_API.get('/', { ...authHeaders(), params });

export const fetchReviewsBySeller = (sellerId, params = {}) =>
  REVIEW_API.get(`/seller/${sellerId}`, { ...authHeaders(), params });