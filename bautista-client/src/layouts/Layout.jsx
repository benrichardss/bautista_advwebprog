import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#ffd41d] text-zinc-900">
      <NavBar />
      <main className="pb-6 pt-26">
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
};

export default Layout;
