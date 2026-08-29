import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyOrders, cancelOrder } from '../../services/OrderService';
import Button from '../../components/Button';
import placeholderImage from '../../assets/img/placeholder-product.png';

const OrderPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await fetchMyOrders(userId);
        setOrders(data.data || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load orders.'
        );
      }
    };

    if (userId && user.role === 'buyer') {
      loadOrders();
    }
  }, [userId, user?.role]);

  const handleCancelOrder = async (orderId) => {
    try {
        await cancelOrder(orderId);

        const { data } = await fetchMyOrders(userId);
        setOrders(data.data || []);
    } catch (requestError) {
        setError(
        requestError.response?.data?.message ||
            'Unable to cancel order.'
        );
    }
    };

  if (!user || user.role !== 'buyer') {
    return (
      <section className="border-y-2 border-zinc-900 bg-zinc-50 p-6">
        <h1 className="font-lexend text-2xl font-bold">
          Only buyers can view orders.
        </h1>
        <Button to="/" className="mt-6">Back Home</Button>
      </section>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Order Tracking
        </p>
        <h1 className="mt-2 text-3xl font-lexend font-bold text-zinc-900">
          My Orders
        </h1>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {error && <p className="text-red-600">{error}</p>}

        {orders.length === 0 ? (
          <p className="font-lexend text-zinc-600">
            You have no orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-5"
                >
                <div className="flex flex-wrap justify-between gap-3">
                    <h2 className="font-lexend font-semibold">
                    Order #{order._id.slice(-8)}
                    </h2>

                    <span className="font-lexend font-bold">
                    {order.orderStatus}
                    </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm font-lexend text-zinc-600 sm:grid-cols-2">
                    <p>
                    Payment method:{' '}
                    <span className="font-semibold text-zinc-900">
                        {order.paymentMethod}
                    </span>
                    </p>

                    <p>
                    Ordered on:{' '}
                    <span className="font-semibold text-zinc-900">
                        {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                    </p>

                    <p className="sm:col-span-2">
                    Address:{' '}
                    <span className="font-semibold text-zinc-900">
                        {order.shippingAddress}
                    </span>
                    </p>
                </div>

                <div className="mt-5 border-t border-zinc-300 pt-4">
                    <h3 className="font-lexend font-semibold text-zinc-900">
                    Products
                    </h3>

                    <div className="mt-3 space-y-3">
                    {order.products.map((item) => {
                        const product = item.product;
                        const itemTotal = Number(item.price) * Number(item.quantity);

                        return (
                        <div
                            key={item._id}
                            className="flex gap-3 border-b border-zinc-300 pb-3"
                        >
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                            <img
                                src={product?.images?.[0] || placeholderImage}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = placeholderImage;
                                }}
                                className="h-full w-full object-cover"
                            />
                            </div>

                            <div className="flex flex-1 flex-col justify-center">
                            <p className="font-lexend font-semibold text-zinc-900">
                                {product?.productName || 'Unavailable product'}
                            </p>

                            <p className="text-sm font-lexend text-zinc-600">
                                Quantity: {item.quantity}
                            </p>

                            <p className="text-sm font-lexend text-zinc-600">
                                PHP {Number(item.price).toFixed(2)} each
                            </p>
                            </div>

                            <p className="self-center font-lexend font-bold text-zinc-900">
                            PHP {itemTotal.toFixed(2)}
                            </p>
                        </div>
                        );
                    })}
                    </div>
                </div>

                <div className="mt-5 border-t-2 border-zinc-900 pt-4 text-right">
                    <p className="font-lexend text-xl font-bold text-zinc-900">
                    Total: PHP {Number(order.totalAmount).toFixed(2)}
                    </p>

                    {order.orderStatus === 'Pending' && (
                        <button
                            type="button"
                            onClick={() => handleCancelOrder(order._id)}
                            className="mt-4 rounded-full border-2 border-red-700 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-700 hover:text-white"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
                </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderPage;