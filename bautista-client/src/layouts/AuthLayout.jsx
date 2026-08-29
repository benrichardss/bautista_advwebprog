import { Outlet } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';

const AuthLayout = () => {
  return (
    <section className="h-screen overflow-hidden bg-zinc-100 text-zinc-900">
      <div className="grid h-full w-full lg:grid-cols-[1fr_0.95fr]">
        <div className="flex h-full items-center justify-center border-b-2 border-zinc-300 bg-zinc-200 p-8 sm:p-10 lg:border-b-0 lg:border-r-2 lg:border-zinc-300 lg:p-16">
          <img src={logo} alt="BulldogEx" className="max-w-full object-contain" />
        </div>

        <main className="min-w-0 overflow-y-auto bg-zinc-50 px-6 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
};

export default AuthLayout;
