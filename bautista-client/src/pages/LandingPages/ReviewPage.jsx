import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import {
  fetchProductsToReview,
  fetchMyReviews,
  createReview,
  updateReview,
} from '../../services/ReviewService';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { Rating } from '@mui/material';

const ReviewPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [activeTab, setActiveTab] = useState('to-review');
  const [productsToReview, setProductsToReview] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [forms, setForms] = useState({});
  const [editingReview, setEditingReview] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadReviews = async () => {
    try {
      setError('');

      const [toReviewResponse, historyResponse] = await Promise.all([
        fetchProductsToReview(userId),
        fetchMyReviews(userId),
      ]);

      setProductsToReview(toReviewResponse.data.data || []);
      setReviewHistory(historyResponse.data.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load reviews.'
      );
    }
  };

  useEffect(() => {
    if (userId && user?.role === 'buyer') {
      loadReviews();
    }
  }, [userId, user?.role]);

  const updateForm = (productId, field, value) => {
    setForms((current) => ({
      ...current,
      [productId]: {
        rating: 5,
        comment: '',
        ...current[productId],
        [field]: value,
      },
    }));
  };

  const handleCreateReview = async (productId) => {
    const form = forms[productId] || {
      rating: 5,
      comment: '',
    };

    if (!form.comment.trim()) {
      setError('Please write a comment before submitting.');
      return;
    }

    try {
      setError('');
      setMessage('');

      await createReview(productId, {
        rating: Number(form.rating),
        comment: form.comment.trim(),
      });

      setMessage('Review submitted successfully.');
      await loadReviews();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to submit review.'
      );
    }
  };

  const handleUpdateReview = async (reviewId) => {
    const form = forms[reviewId];

    if (!form?.comment.trim()) {
      setError('Please write a comment before saving.');
      return;
    }

    try {
      setError('');
      setMessage('');

      await updateReview(reviewId, {
        rating: Number(form.rating),
        comment: form.comment.trim(),
      });

      setEditingReview(null);
      setMessage('Review updated successfully.');
      await loadReviews();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update review.'
      );
    }
  };

  if (!user || user.role !== 'buyer') {
    return (
      <section className="border-y-2 border-zinc-900 bg-zinc-50 p-6">
        <h1 className="font-lexend text-2xl font-bold">
          Only buyer accounts can manage reviews.
        </h1>
        <Button to="/">Back Home</Button>
      </section>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
          My Reviews
        </p>

        <h1 className="mt-2 text-3xl font-lexend font-bold text-zinc-900">
          Review your purchases
        </h1>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-3 border-b-2 border-zinc-900 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('to-review')}
              className={`rounded-full border-2 px-4 py-2 text-sm font-lexend ${
                activeTab === 'to-review'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 text-zinc-700'
              }`}
            >
              To review
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`rounded-full border-2 px-4 py-2 text-sm font-lexend ${
                activeTab === 'history'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 text-zinc-700'
              }`}
            >
              Review history
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm font-lexend text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm font-lexend text-green-700">
              {message}
            </p>
          )}

          {activeTab === 'to-review' ? (
            <div className="mt-6 space-y-5">
              {productsToReview.length === 0 ? (
                <p className="font-lexend text-zinc-600">
                  You have no delivered products waiting for review.
                </p>
              ) : (
                productsToReview.map((item) => {
                  const product = item.product;
                  const form = forms[product._id] || {
                    rating: 5,
                    comment: '',
                  };

                  return (
                    <article
                      key={product._id}
                      className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <img
                          src={product.images?.[0] || placeholderImage}
                          alt={product.productName}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = placeholderImage;
                          }}
                          className="h-32 w-full rounded-2xl object-cover sm:w-40"
                        />

                        <div className="flex-1">
                          <h2 className="font-lexend text-lg font-semibold">
                            {product.productName}
                          </h2>

                          <p className="mt-2 font-lexend font-bold">
                            PHP {Number(product.price).toFixed(2)}
                          </p>

                          <div className="mt-4">
                            <Rating
                              value={Number(form.rating)}
                              onChange={(event, newValue) =>
                                updateForm(
                                  product._id,
                                  'rating',
                                  newValue || 1
                                )
                              }
                            />
                          </div>

                          <textarea
                            value={form.comment}
                            onChange={(event) =>
                              updateForm(
                                product._id,
                                'comment',
                                event.target.value
                              )
                            }
                            rows="3"
                            placeholder="Write your review"
                            className="mt-3 w-full rounded-xl border-2 border-zinc-300 p-3 font-lexend"
                          />

                          <button
                            type="button"
                            onClick={() => handleCreateReview(product._id)}
                            className="rounded-full border-2 border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-lexend text-white"
                          >
                            Submit review
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reviewHistory.length === 0 ? (
                <p className="font-lexend text-zinc-600">
                  You have no review history.
                </p>
              ) : (
                reviewHistory.map((review) => {
                  const product = review.product;
                  const form = forms[review._id] || {
                    rating: review.rating,
                    comment: review.comment || '',
                  };

                  return (
                    <article
                      key={review._id}
                      className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <img
                          src={product.images?.[0] || placeholderImage}
                          alt={product.productName}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = placeholderImage;
                          }}
                          className="h-32 w-full rounded-2xl object-cover sm:w-40"
                        />

                        <div className="flex-1">
                          <h2 className="font-lexend text-lg font-semibold">
                            {product?.productName || 'Product'}
                          </h2>

                          {editingReview === review._id ? (
                              <>
                              <div className="mt-3">
                                  <Rating
                                  value={Number(form.rating)}
                                  onChange={(event, newValue) =>
                                      updateForm(
                                      review._id,
                                      'rating',
                                      newValue || 1
                                      )
                                  }
                                  />
                              </div>

                              <textarea
                                  value={form.comment}
                                  onChange={(event) =>
                                  updateForm(
                                      review._id,
                                      'comment',
                                      event.target.value
                                  )
                                 }
                                rows="3"
                                className="mt-3 w-full rounded-xl border-2 border-zinc-300 p-3 font-lexend"
                              />

                              <button
                                type="button"
                                onClick={() => handleUpdateReview(review._id)}
                                className="mt-3 rounded-full border-2 border-zinc-900 bg-zinc-900 px-4 py-2 text-sm text-white"
                              >
                                Save changes
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="mt-2">
                                <Rating value={Number(review.rating)} readOnly />
                              </div>

                              <p className="mt-2 font-lexend text-zinc-700">
                                {review.comment || 'No comment provided.'}
                              </p>

                              <button
                                type="button"
                                onClick={() => {
                                setEditingReview(review._id);
                                setForms((current) => ({
                                    ...current,
                                    [review._id]: {
                                    rating: review.rating,
                                    comment: review.comment || '',
                                    },
                                  }));
                                }}
                                  className="mt-3 rounded-full border-2 border-zinc-900 px-4 py-2 text-sm font-lexend"
                              >
                                Edit review
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReviewPage;