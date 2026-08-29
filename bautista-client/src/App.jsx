import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// HomePage Structure
import Layout from './layouts/Layout';
import ProductPage from './pages/LandingPages/ProductPage';
import HomePage from './pages/LandingPages/HomePage';
import AboutPage from './pages/LandingPages/AboutPage';
import CartPage from './pages/LandingPages/CartPage';
import OrderPage from './pages/LandingPages/OrderPage';
import ReviewPage from './pages/LandingPages/ReviewPage';
import AccountPage from './pages/LandingPages/AccountPage';
import ProductListPage from './pages/LandingPages/ProductListPage';

// Auth Pages Structure
import AuthLayout from './layouts/AuthLayout';
import SignInPage from './pages/AuthPages/SignInPage';
import SignUpPage from './pages/AuthPages/SignUpPage';

import NotFoundPage from './pages/NotFoundPage';

import DashLayout from './layouts/DashLayout';
import UsersPage from './pages/DashboardPages/UsersPage';
import DashProductListPage from './pages/DashboardPages/DashProductListPage';
import DashOrderListPage from './pages/DashboardPages/DashOrderListPage';
import DashReviewListPage from './pages/DashboardPages/DashReviewListPage';

const routes = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:name',
        element: <ProductPage />,
      },
      {
        path: 'carts',
        element: <CartPage />
      },
      {
        path: 'orders',
        element: <OrderPage />
      },
      {
        path: 'reviews',
        element: <ReviewPage />,
      },
      {
        path: 'account',
        element: <AccountPage />,
      }
    ],
  },
  {
    path: "auth/",
    element: <AuthLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "signin",
        element: <SignInPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      }
    ],
  },
  {
    path: "dashboard/",
    element: <DashLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "products",
        element: <DashProductListPage />
      },
      {
        path: 'orders',
        element: <DashOrderListPage />,
      },
      {
        path: "reviews",
        element: <DashReviewListPage />
      },
      {
        path: "users",
        element: <UsersPage />
      },
    ]
  }
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
