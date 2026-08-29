import Button from '../../components/Button.jsx';
import ProductList from '../../components/ProductList.jsx';
import { useEffect, useState } from 'react';
import { fetchProducts, fetchCategories } from '../../services/ProductService';
import placeholderImage from '../../assets/img/placeholder-product.png';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await fetchProducts({
          limit: 100,
          search: search || undefined,
          category: selectedCategory || undefined,
        });

        setProducts(
          data.data.map((product) => ({
            id: product._id,
            name: product._id,
            image: product.images?.[0] || placeholderImage,
            title: product.productName,
            category: product.category?.categoryName || 'Uncategorized',
            price: product.price,
            stock: product.stock > 0 ? 'In stock' : 'Out of stock',
            content: [product.description || 'No description available.'],
          }))
        );
      } catch (requestError) {
        console.error('Error fetching products:', requestError);
        setError('Unable to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, selectedCategory]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await fetchCategories();
        setCategories(data.data || []);
      } catch (requestError) {
        console.error('Error fetching categories:', requestError);
      }
    };

    loadCategories();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Products
        </p>
        <h1 className="max-w-xl text-3xl font-lexend font-bold leading-tight text-zinc-900 sm:text-4xl">
          Shop campus essentials in a simple product grid
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 font-lexend text-zinc-600 sm:text-base">
          Browse practical items for class, study, commute, and everyday campus routines.
        </p>
        <div className="mt-6">
          <Button to="/">Back Home</Button>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Featured Products
          </p>
          <h2 className="mt-2 text-2xl font-lexend font-semibold text-zinc-900">Product card grid</h2>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border-2 border-zinc-900 bg-zinc-50 px-4 py-3 text-sm font-lexend text-zinc-900 outline-none"
          />

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-zinc-900 bg-zinc-50 px-4 py-3 pr-10 text-sm font-lexend text-zinc-900 outline-none"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700">
              ▾
            </span>
          </div>
        </div>

        {loading ? (
          <p className="font-lexend text-zinc-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="font-lexend text-zinc-600">
            No products found.
          </p>
        ) : (
          <ProductList products={products} />
        )}
      </section>
    </div>
  );
}

export default ProductListPage
