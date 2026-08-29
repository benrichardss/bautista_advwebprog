import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import banner from '../../assets/img/nu_bulldogex_banner.jpg';
import placeholderImage from '../../assets/img/placeholder-product.png';
import { fetchCategories, fetchProducts } from '../../services/ProductService';
import { fetchAllOrders } from '../../services/OrderService';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
        orders: 0,
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const [categoryResponse, productResponse, orderResponse] = await Promise.all([
                    fetchCategories(),
                    fetchProducts({ limit: 100 }),
                    fetchAllOrders({ limit: 1 }),
                ]);

                const categoryData = categoryResponse.data.data;
                const productData = productResponse.data.data;

                const categoriesWithImages = categoryData.map((category) => {
                    const categoryProduct = productData.find(
                        (product) =>
                            product.category?._id === category._id
                    );

                    return {
                        ...category,
                        image: categoryProduct?.images?.[0] || placeholderImage,
                    };
                });

                setCategories(categoriesWithImages);

                setStats({
                    products: productResponse.data.pagination?.total ?? productData.length,
                    categories: categoryResponse.data.pagination?.total ?? categoryData.length,
                    orders: orderResponse.data.pagination?.total ?? 0,
                });
            } catch (requestError) {
                console.error('Error fetching categories:', requestError);
                setError('Unable to load categories.');
            }
        };

        loadCategories();
    }, []);
    return (
        <div className="flex w-full flex-col gap-6">
            <section className="relative min-h-[28rem] overflow-hidden border-y-2 border-zinc-900 bg-zinc-900 px-4 py-10 sm:px-6 lg:px-8">
                <img
                    src={banner}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-zinc-900/45" />

                <div className="relative z-10 flex min-h-[22rem] items-start justify-end text-right sm:min-h-[24rem]">
                    <div className="max-w-xl">
                        <p className="mb-3 text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-200">
                            Campus Marketplace
                        </p>
                        <h1 className="text-3xl font-lexend font-bold leading-tight text-zinc-50 sm:text-4xl">
                            Welcome to BulldogEx Shop
                        </h1>
                        <p className="mt-4 text-sm leading-7 font-lexend text-zinc-100 sm:text-base">
                            Explore campus uniforms, student essentials, and school merch in one
                            quick storefront.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <Button to="/products">
                                Shop Now
                            </Button>
                            <Button to="/about" variant="primary">
                                About Store
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-6">
                    <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
                        Store Overview
                    </p>
                    <h2 className="mt-2 text-2xl font-lexend font-semibold text-zinc-900">Quick shopping blocks</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
                    <div className="rounded-3xl border-2 border-zinc-900 bg-[#35408f] p-5">
                        <p className="text-2xl font-lexend font-bold text-[#ffd41d]">{stats.products}</p>
                        <p className="mt-2 text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] text-[#ffd41d]">
                            Products
                        </p>
                    </div>
                    <div className="rounded-3xl border-2 border-zinc-900 bg-[#35408f] p-5">
                        <p className="text-2xl font-lexend font-bold text-[#ffd41d]">{stats.categories}</p>
                        <p className="mt-2 text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] text-[#ffd41d]">
                            Categories
                        </p>
                    </div>
                    <div className="rounded-3xl border-2 border-zinc-900 bg-[#35408f] p-5">
                        <p className="text-2xl font-lexend font-bold text-[#ffd41d]">{stats.orders}</p>
                        <p className="mt-2 text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] text-[#ffd41d]">
                            Orders
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-6">
                    <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
                        Shop Sections
                    </p>
                    <h2 className="mt-2 text-2xl font-lexend font-semibold text-zinc-900">Simple store cards</h2>
                </div>

                {error ? (
                    <p className="font-lexend text-zinc-600">{error}</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                        {categories.slice(0, 3).map((category) => (
                            <article
                                key={category._id}
                                className="flex flex-col rounded-3xl border-2 border-zinc-900 bg-zinc-100 p-4"
                            >
                                <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-zinc-200">
                                    <img
                                        src={category.image}
                                        alt={category.categoryName}
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src = placeholderImage;
                                        }}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <h3 className="mt-4 text-lg font-lexend font-semibold text-zinc-900">
                                    {category.categoryName}
                                </h3>

                                <p className="mb-4 mt-3 text-sm leading-6 font-lexend text-zinc-600">
                                    {category.description || 'Browse products in this category.'}
                                </p>

                                <div className="mt-auto">
                                    <Button to="/products" variant="primary">
                                        View Products
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;