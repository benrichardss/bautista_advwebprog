import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { useAuth } from '../../context/AuthContext';
import { fetchProductById } from '../../services/ProductService';
import { fetchProductReviews } from '../../services/ReviewService';
import { addToCart } from '../../services/CartService';

const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-8 w-8 shrink-0 text-zinc-700"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="3.5" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 20c.8-3.2 3.3-5 7.5-5s6.7 1.8 7.5 5"
    />
  </svg>
);

function ProductPage() {
  const { name: productId } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');

  const userId = user?.id || user?._id;
  const canAddToCart = user?.role === 'buyer';

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await fetchProductById(productId);
        setProduct(data.data);
      } catch (requestError) {
        console.error('Error fetching product:', requestError);
        setError('Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    const loadReviews = async () => {
      try {
        setReviewError('');

        const { data } = await fetchProductReviews(productId);
        setReviews(data.data || []);
      } catch (requestError) {
        console.error(
          'Error fetching reviews:',
          requestError.response?.data || requestError.message
        );
        setReviewError('Unable to load reviews.');
      }
    };

    loadProduct();
    loadReviews();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!canAddToCart) {
      setCartMessage(
        user
          ? 'Only buyer accounts can add products to the cart.'
          : 'Please sign in as a buyer to add products to the cart.'
      );
      return;
    }

    try {
      await addToCart(userId, productId, 1);
      setCartMessage('Product added to cart.');
    } catch (requestError) {
      setCartMessage(
        requestError.response?.data?.message ||
          'Unable to add product to cart.'
      );
    }
  };

  if (loading) {
    return <p className="p-6 font-lexend">Loading product...</p>;
  }

  if (error || !product) {
    return (
      <section className="border-y-2 border-zinc-900 bg-zinc-50 p-6">
        <h1 className="text-3xl font-lexend font-bold text-zinc-900">
          {error || 'Product not found'}
        </h1>
        <Button to="/products" className="mt-6">
          Back to Products
        </Button>
      </section>
    );
  }

  const image = product.images?.[0] || placeholderImage;
  const formattedPrice = Number(product.price).toFixed(2);
  const category =
    typeof product.category === 'object'
      ? product.category.categoryName
      : 'Uncategorized';

  const seller =
    typeof product.seller === 'object'
      ? product.seller
      : null;

  const sellerName = seller
    ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim()
    : 'Unknown seller';
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <Button to="/products">Back to Products</Button>

          <p className="mb-3 mt-4 text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {category}
          </p>

          <h1 className="text-3xl font-lexend font-bold leading-tight text-zinc-900 sm:text-4xl">
            {product.productName}
          </h1>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600">
            <span className="font-lexend font-bold text-zinc-900">
              PHP {formattedPrice}
            </span>
            <span className="font-lexend">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.25rem] border-2 border-zinc-900 bg-zinc-200">
            <img
              src={image}
              alt={product.productName}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = placeholderImage;
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="text-base leading-7 font-lexend text-zinc-700 whitespace-pre-wrap">
            {product.description || 'No description available.'}
          </p>

          <div className="mt-8 border-t-2 border-zinc-900 pt-6">
            {canAddToCart ? (
              <Button
                variant="primary"
                className="mr-3"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            ) : (
              <p className="mb-3 text-sm font-lexend text-zinc-600">
                Only buyer accounts can add products to the cart.
              </p>
            )}
            <Button to="/products">Back to Products</Button>
            {cartMessage && (
              <p className="mt-4 text-sm font-lexend text-zinc-600">
                {cartMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-lexend font-semibold text-zinc-900">
            Reviews
          </h2>

          {reviewError && (
            <p className="mt-4 text-sm font-lexend text-red-600">
              {reviewError}
            </p>
          )}

          
          {reviews.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-600">
              No reviews yet.
            </p>
          ) : (
            reviews.map((review) => (
              <article key={review._id} className="border-b border-zinc-300 py-4">
                <p className="font-semibold">
                  {review.reviewer.firstName} {review.reviewer.lastName}
                </p>
                <p>Rating: {review.rating}/5</p>
                <p>{review.comment}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <PersonIcon />

          <div>
            <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Seller
            </p>

            <h2 className="text-2xl font-lexend font-semibold text-zinc-900">
              {sellerName}
            </h2>

            {seller?.email && (
              <p className="text-sm font-lexend text-zinc-600">
                {seller.email}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;