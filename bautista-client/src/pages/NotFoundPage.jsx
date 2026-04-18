import Button from '../components/Button';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#ffd41d] px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-5xl border-2 border-zinc-900 bg-zinc-50 rounded-3xl overflow-hidden">
        
        <div className="border-b-2 border-zinc-900 bg-[#35408f] px-6 py-6 text-right">
          <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-200">
            Error
          </p>
          <h1 className="text-6xl sm:text-7xl font-lexend font-bold text-[#ffd41d] leading-none">
            404
          </h1>
        </div>

        <div className="px-6 py-8 sm:px-8 sm:py-10 grid gap-8 md:grid-cols-2">
          
          <div>
            <h2 className="text-2xl font-lexend font-semibold text-zinc-900">
              Page not found
            </h2>
            <p className="mt-3 text-sm leading-6 font-lexend text-zinc-600">
              The page you're looking for doesn’t exist, was removed, or never existed in the first place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/">Back Home</Button>
              <Button to="/products">Browse Products</Button>
            </div>
          </div>

          <div className="grid gap-4">
            
            <div className="rounded-2xl border-2 border-zinc-900 bg-zinc-100 p-4 flex flex-col">
              <h3 className="font-semibold font-lexend text-zinc-900">Home</h3>
              <p className="mt-1 text-sm font-lexend text-zinc-600">
                Return to the main page
              </p>
              <Button to="/" className="mt-3">Go Home</Button>
            </div>

            <div className="rounded-2xl border-2 border-zinc-900 bg-zinc-100 p-4 flex flex-col">
              <h3 className="font-semibold font-lexend text-zinc-900">Products</h3>
              <p className="mt-1 text-sm font-lexend text-zinc-600">
                Check out available items
              </p>
              <Button to="/products" className="mt-3">View Products</Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;