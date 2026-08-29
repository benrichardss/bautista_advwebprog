import { useEffect, useState } from 'react';
import Button from '../../components/Button.jsx';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
} from '../../services/CartService';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { checkoutCart } from '../../services/OrderService';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [cart, setCart] = useState({
    products: [],
    totalPrice: 0.00,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const loadCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await fetchCart(userId);
      setCart(data.data);
    } catch (requestError) {
      console.error('Error loading cart:', requestError);
      setError('Unable to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  useEffect(() => {
    setShippingAddress(user?.address || '');
  }, [user?.address]);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      const { data } = await updateCartQuantity(
        userId,
        productId,
        Number(quantity)
      );

      setCart(data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update quantity.'
      );
    }
  };

  const handleRemove = async (productId) => {
    try {
      const { data } = await removeFromCart(userId, productId);
      setCart(data.data);
    } catch (requestError) {
      setError('Unable to remove product.');
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      setCheckoutError('Please provide a shipping address.');
      return;
    }

    try {
      setCheckoutError('');

      await checkoutCart(userId, {
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
      });

      navigate('/orders');
    } catch (requestError) {
      setCheckoutError(
        requestError.response?.data?.message ||
          'Unable to complete checkout.'
      );
    }
  };

  if (!user) {
    return (
      <section className="border-y-2 border-zinc-900 bg-zinc-50 p-6">
        <h1 className="text-3xl font-lexend font-bold text-zinc-900">
          Please sign in to view your cart.
        </h1>
        <Button to="/auth/signin" className="mt-6">
          Sign In
        </Button>
      </section>
    );
  }

  if (!user || user.role !== 'buyer') {
    return (
      <section className="border-y-2 border-zinc-900 bg-zinc-50 p-6">
        <h1 className="text-3xl font-lexend font-bold text-zinc-900">
          Only buyer accounts can access the cart.
        </h1>
        <Button to="/" className="mt-6">Back Home</Button>
      </section>
    );
  }

  if (loading) {
    return <p className="p-6 font-lexend">Loading cart...</p>;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Shopping Cart
        </p>

        <h1 className="max-w-xl text-3xl font-lexend font-bold leading-tight text-zinc-900 sm:text-4xl">
          Products added to your cart
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-7 font-lexend text-zinc-600 sm:text-base">
          Review your selected products before continuing to checkout.
        </p>

        <div className="mt-6">
          <Button to="/products">Continue Shopping</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Cart Items
          </p>

          <h2 className="mt-2 text-2xl font-lexend font-semibold text-zinc-900">
            Your selected products
          </h2>
        </div>

        {error && (
          <p className="mb-4 text-sm font-lexend text-red-600">{error}</p>
        )}

        {cart.products.length === 0 ? (
          <p className="font-lexend text-zinc-600">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {cart.products.map((item) => {
              const product = item.product;

              return (
                <article
                  key={item._id}
                  className="flex flex-col gap-4 rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4 sm:flex-row"
                >
                  <div className="h-32 w-full overflow-hidden rounded-2xl bg-zinc-200 sm:w-40">
                    <img
                      src={product?.images?.[0] || placeholderImage}
                      alt={product?.productName || 'Product'}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = placeholderImage;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="text-lg font-lexend font-semibold text-zinc-900">
                      {product?.productName || 'Unavailable product'}
                    </h3>

                    <p className="mt-2 font-lexend font-bold text-zinc-900">
                      PHP {Number(product?.price || 0).toFixed(2)}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                      <label
                        htmlFor={`quantity-${item._id}`}
                        className="text-sm font-lexend text-zinc-600"
                      >
                        Quantity
                      </label>

                      <input
                        id={`quantity-${item._id}`}
                        type="number"
                        min="1"
                        max={product?.stock}
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(
                            product._id,
                            event.target.value
                          )
                        }
                        className="w-20 rounded-lg border border-zinc-300 p-2"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        className="rounded-full border-2 border-zinc-900 px-4 py-2 text-xs font-semibold uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="border-t-2 border-zinc-900 pt-6 text-right">
              <p className="font-lexend text-xl font-bold text-zinc-900">
                Total: PHP {Number(cart.totalPrice).toFixed(2)}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-lexend text-zinc-700">
                Shipping address
              </p>

              {user.address && (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress(false);
                      setShippingAddress(user.address);
                    }}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-lexend ${
                      !useNewAddress
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-300 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    Registered address
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUseNewAddress(true);
                      setShippingAddress('');
                    }}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-lexend ${
                      useNewAddress
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-300 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    New address
                  </button>
                </div>
              )}

              {!useNewAddress && user.address ? (
                <div className="mt-3 rounded-xl border-2 border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-lexend text-zinc-700">
                  {user.address}
                </div>
              ) : (
                <textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  rows="3"
                  required
                  placeholder="Enter your new shipping address"
                  className="mt-3 w-full rounded-xl border-2 border-zinc-900 px-4 py-3 font-lexend"
                />
              )}

              {!user.address && (
                <p className="mt-2 text-sm font-lexend text-zinc-600">
                  Enter an address for this order.
                </p>
              )}
            </div>

            {checkoutError && (
              <p className="text-sm font-lexend text-red-600">
                {checkoutError}
              </p>
            )}

            <div className="mt-6">
              <p className="text-sm font-lexend text-zinc-700">
                Payment method
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {['Cash', 'GCash', 'Card'].map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-lexend text-sm transition ${
                      paymentMethod === method
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-zinc-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="h-4 w-4 accent-zinc-900"
                    />

                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 rounded-full border-2 border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Checkout
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default CartPage;