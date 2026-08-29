
  import { useState } from 'react';
  import { Link, NavLink, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import logo from '../assets/img/nubdexchange_logo.png';

  const navLinkClassName = ({ isActive }) =>
    [
      'inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-poppins text-[11px] font-semibold uppercase tracking-[0.24em] transition',
      isActive
        ? 'border-zinc-900 bg-[#ffd41d] text-[#35408f]'
        : 'border-transparent text-[#ffd41d] hover:border-zinc-900 hover:bg-[#FFE14D] hover:text-[#35408f]',
    ].join(' ');

  const PersonIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
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

  const NavBar = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const links = [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Products', to: '/products' },
      ...(user?.role === 'buyer' ? [{ label: 'Cart', to: '/carts' }] : []),
    ];

    const handleLogout = () => {
      logout();
      setMenuOpen(false);
      navigate('/');
    };

    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-zinc-900 bg-[#35408f] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <img src={logo} alt="BulldogEx" className="h-9 w-9 rounded-full border-2 border-zinc-900 bg-zinc-50 object-contain" />
            <div className="space-y-0.5">
              <p className="font-bungee text-xl font-bold text-[#ffd41d]">BulldogEx Shop</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClassName}>
                {link.label}
              </NavLink>
            ))}

            {!user ? (
              <NavLink to="/auth/signin" className={navLinkClassName}>
                Sign in
              </NavLink>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className={navLinkClassName({ isActive: false })}
                >
                  <PersonIcon />

                  <span className="flex flex-col items-start leading-tight">
                    <span className="font-poppins text-[8px] font-medium uppercase tracking-[0.16em] text-[#ffd41d]/75">
                      {user.role}
                    </span>

                    <span className="font-poppins text-xs font-semibold tracking-normal text-[#ffd41d]">
                      {user.firstName}
                    </span>
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border-2 border-zinc-900 bg-white p-2 shadow-lg">
                    {user.role !== 'buyer' && (
                      <Link
                        to="/dashboard/products"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                      >
                        Manage Products
                      </Link>
                    )}

                    <Link
                      to={user.role !== 'buyer' ? '/dashboard/orders' : '/orders'}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                    >
                      {user.role !== 'buyer' ? 'Manage Orders' : 'My Orders'}
                    </Link>

                    <Link
                      to={user.role !== 'buyer' ? '/dashboard/reviews' : '/reviews'}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                    >
                      {user.role !== 'buyer' ? 'Manage Reviews' : 'My Reviews'}
                    </Link>

                    <Link
                      to={user.role !== 'admin' ? '/account' : '/dashboard/users'}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                    >
                      {user.role !== 'admin' ? 'Manage Account' : 'Manage Users'}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>  
        </div>
      </header>
    );
  };

  export default NavBar;
