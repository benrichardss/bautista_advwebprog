const Footer = () => {
  return (
    <footer class="border-t-2 border-zinc-900 bg-[#35408f] text-[#ffd41d] px-4 py-10 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl grid gap-8 md:grid-cols-4">

        <div>
          <h2 class="font-bungee text-xl text-[#ffd41d]">BulldogEx Shop</h2>
          <p class="font-lexend mt-3 text-sm text-zinc-200 leading-6">
            Your campus marketplace for uniforms, merch, and student essentials.
          </p>
        </div>

        <div>
          <p class="text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] mb-3">
            Navigation
          </p>
          <ul class="space-y-2 text-sm">
            <li><a href="/" class="hover:underline font-lexend" >Home</a></li>
            <li><a href="/about" class="hover:underline font-lexend">About</a></li>
            <li><a href="/products" class="hover:underline font-lexend">Products</a></li>
          </ul>
        </div>

        <div>
          <p class="text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] mb-3">
            Shop
          </p>
          <ul class="space-y-2 text-sm">
            <li><a href="/products" class="hover:underline font-lexend">T-Shirts</a></li>
            <li><a href="/products" class="hover:underline font-lexend">Hats</a></li>
            <li><a href="/products" class="hover:underline font-lexend">Stickers</a></li>
          </ul>
        </div>

        <div>
          <p class="text-[11px] font-lexend font-semibold uppercase tracking-[0.24em] mb-3">
            Info
          </p>
          <ul class="space-y-2 text-sm text-zinc-200">
            <li className="font-lexend">Pickup Only</li>
            <li className="font-lexend">Campus Orders</li>
            <li className="font-lexend">Secure Checkout</li>
          </ul>
        </div>

      </div>

      <div class="mt-10 border-t-2 border-zinc-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-lexendtext-xs text-zinc-300">
        <p>© 2026 BulldogEx Shop. All rights reserved.</p>
        <p class="uppercase tracking-[0.2em]">NU Bulldogs Marketplace</p>
      </div>
    </footer>
  )
}

export default Footer
