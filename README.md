# CTWEBPGL Web Programming - Long Exam 1

This repository contains a full-stack e-commerce application called **BulldogEx Shop**, a campus marketplace wireframe built with a **React (Vite) client** and a **Node.js/Express + MongoDB server**. It includes product catalog browsing, cart and checkout, order management, product reviews, and role-based dashboards for **admin**, **seller**, and **buyer** accounts.

The project is split into two independent applications that communicate over a REST API:

```text
bautista-advwebprog-longexam/
├── bautista-client/   # React (Vite) frontend
└── bautista-server/   # Express + MongoDB backend
```

## Tech Stack

### Client (`bautista-client`)

| Package | Purpose |
|---|---|
| `react` / `react-dom` | Core UI library used to build the component tree. |
| `vite` / `@vitejs/plugin-react` | Dev server and build tool with fast HMR for React. |
| `react-router-dom` | Client-side routing — defines the route tree in `App.jsx` and handles nested layouts (`Layout`, `AuthLayout`, `DashLayout`). |
| `axios` | HTTP client used inside the `services/` layer to call the Express API. |
| `@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`, `@mui/x-charts` | Material UI component library — used for the dashboard pages (data grids, ratings, dialogs, charts, form controls). |
| `@emotion/react`, `@emotion/styled`, `styled-components`, `@mui/styled-engine-sc` | CSS-in-JS styling engines required by Material UI's component styling system. |
| `tailwindcss` / `@tailwindcss/vite` | Utility-first CSS framework used for the storefront-facing pages (`LandingPages`, layouts, components). |
| `leaflet` / `react-leaflet` | Map rendering library (available for location-based features). |
| `dotenv` | Loads environment variables (e.g. `VITE_API_URL`) into the client build. |
| `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | Linting for code quality and React best practices. |

### Server (`bautista-server`)

| Package | Purpose |
|---|---|
| `express` | Web framework used to define REST routes, middleware, and the HTTP server. |
| `mongoose` | ODM used to define schemas/models (`Product`, `Category`, `User`, `Review`, `Cart`, `Order`) and query MongoDB. |
| `jsonwebtoken` | Issues and verifies JWT access tokens for authenticated routes. |
| `bcryptjs` | Hashes and compares user passwords before storing/authenticating. |
| `cors` | Enables cross-origin requests from the client (configured with explicit headers/methods in `index.js`). |
| `dotenv` | Loads `.env` values (`MONGO_URI`, `SECRET_KEY`, `SALT`, `PORT`) used by `config/config.js`. |
| `body-parser` | Parses incoming JSON and URL-encoded request bodies. |
| `nodemon` *(dev)* | Restarts the server automatically on file changes during development. |

## Integrating the Client and the Server

The client and server are two separate Node projects that are connected purely through HTTP calls — there is no shared build step between them.

### 1. Server exposes a REST API

`bautista-server/index.js` boots an Express app, connects to MongoDB via `connectDB()` (`config/db.js`), and mounts one router per resource under `/api`:

```js
app.use("/api/product", productRoutes);
app.use("/api/v1/product", productV1Routes); // versioned product endpoints
app.use("/api/category", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
```

CORS is explicitly configured (allowed headers/methods, `Access-Control-Allow-Origin: *`) so the Vite dev server (a different origin/port) is allowed to call these endpoints.

### 2. Client points to the server via an environment variable

The client never hardcodes the API URL. `bautista-client/src/constants.js` reads it from Vite's environment variables:

```js
const HOST = `${import.meta.env.VITE_API_URL}`;
export default { HOST };
```

This means each developer creates a `.env` file inside `bautista-client/` with:

```env
VITE_API_URL=http://localhost:8000/api
```

pointing at wherever `bautista-server` is running (the server's own `.env` defines `PORT`, defaulting to `8000`).

### 3. Client calls the API through a Service Layer

Every resource has a corresponding file in `bautista-client/src/services/` (`ProductService.js`, `ReviewService.js`, `OrderService.js`, `CartService.js`, `UserService.js`). Each file creates its own `axios` instance scoped to that resource's base path:

```js
const REVIEW_API = axios.create({
  baseURL: `${constants.HOST}/review`,
});
```

Pages and components never call `axios` directly — they import functions from these service files (e.g. `fetchAllReviews()`, `createReview()`), which keeps API logic decoupled from UI logic.

### 4. Authentication is passed via JWT Bearer tokens

On sign in, the server issues a JWT (`jsonwebtoken`) which the client stores in `localStorage`. Protected service calls attach it as a Bearer token:

```js
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
```

On the server, `middleware/authMiddleware.js` verifies this token on protected routes and attaches the decoded payload to `req.user`, rejecting the request with `401` if the token is missing or invalid.

### 5. Role-based access is resolved on both ends

The logged-in user's `role` (`admin`, `seller`, `buyer`) is stored client-side via `AuthContext` (`useAuth()`), which pages use to decide what to render (e.g. `DashReviewListPage` calls `fetchAllReviews()` for admins vs. `fetchReviewsBySeller(sellerId)` for sellers) and which links appear in `DashLayout`'s sidebar. On the server, controllers use the `sellerId`/role passed in as a route param or query to scope the MongoDB query (e.g. filtering `Review`/`Order`/`Product` documents to a seller's own products).

## Design Patterns

### Client (React)

- **Component-Based Architecture** — the UI is decomposed into small, reusable components (`Button`, `ProductCard`, `ProductList`, `NavBar`, `Footer`) composed into full pages.
- **Layout / Composition Pattern** — `App.jsx` defines a route tree where routes are nested under shared layout components (`Layout` for the public storefront, `AuthLayout` for sign in/up, `DashLayout` for the dashboard), each rendering an `<Outlet />` for its child pages. This avoids repeating navigation/chrome markup on every page.
- **Service Layer / API Gateway Pattern** — all HTTP communication is centralized in `src/services/*.js`. Pages/components are decoupled from `axios` and from the shape of API calls, so the backend can change its implementation without every page needing edits.
- **Provider / Context Pattern** — `AuthContext.jsx` uses React's Context API to share the current authenticated `user` (and `login`/`logout` actions) across the whole component tree without prop-drilling.
- **Controlled Components / Local State Pattern** — forms (product forms, review forms, filters) are built with controlled inputs (`useState` + `onChange`) rather than uncontrolled refs.
- **Conditional Rendering by Role** — dashboard pages (e.g. `DashReviewListPage`) branch their data-fetching and UI (such as showing an "Edit" column only for `admin`) based on `user.role`, effectively acting as a lightweight role-based access control layer on the frontend.

### Server (Express + MongoDB)

- **MVC-inspired layered architecture** — the server is split into `models/` (Mongoose schemas defining data shape), `controllers/` (business logic and request/response handling), and `routes/` (URL-to-controller mapping), keeping each concern in its own file/folder.
- **Middleware Pattern** — `authMiddleware.js` is an Express middleware function inserted into the request pipeline (`router.get('/', authMiddleware, controller.fn)`) to handle cross-cutting concerns (authentication) without duplicating logic inside every controller.
- **Repository-style Data Access via Mongoose Models** — controllers never query MongoDB directly; they go through Mongoose models (`Product.find()`, `Review.findById()`, etc.), which encapsulate schema validation and query building.
- **RESTful Resource Routing** — each resource (`product`, `category`, `user`, `review`, `cart`, `order`) has its own Express `Router`, mounted at a predictable base path (`/api/<resource>`), with conventional verbs (`GET`, `POST`, `PUT`/`PATCH`, `DELETE`) mapped to CRUD operations.
- **API Versioning Pattern** — `routes/v1/productRoutes.js` demonstrates a versioned endpoint (`/api/v1/product`) existing alongside the unversioned one, allowing the API surface to evolve without breaking existing consumers.
- **Centralized Configuration** — environment-dependent values (Mongo URI, JWT secret, salt rounds, port) are isolated in `config/config.js` and `config/constants.js` instead of being scattered across controllers.
- **Centralized Error Handling** — `index.js` registers a final Express error-handling middleware that catches unhandled errors and returns a uniform `500` JSON response.


## Project Setup

### Server

```bash
cd bautista-server
npm install
```

Create a `.env` file inside `bautista-server/` with:

```env
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<your-jwt-secret>
SALT=10
PORT=8000
```

Run the server in development mode (auto-restarts via `nodemon`):

```bash
npm run dev
```

Or run it normally:

```bash
npm start
```

### Client

```bash
cd bautista-client
npm install
```

Create a `.env` file inside `bautista-client/` with:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```


## Current Routes (Client)

- `/` - Home page
- `/about` - About page
- `/products` - Product list page
- `/products/:name` - Single product page
- `/cart` - Cart page
- `/orders` - Order history page
- `/reviews` - Buyer review management page
- `/account` - Account page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - Dashboard home (admin/seller)
- `/dashboard/dashproducts` - Product management
- `/dashboard/dashorders` - Order management
- `/dashboard/dashreviews` - Review management
- `/dashboard/users` - User management (admin)
- `/dashboard/reports` - Reports

## Current API Base Paths (Server)

- `/api/product` and `/api/v1/product` - Product CRUD and listing
- `/api/category` - Category CRUD
- `/api/user` - Auth (sign in/up) and user management
- `/api/review` - Review CRUD, per-product/per-reviewer/per-seller listing
- `/api/cart` - Cart operations
- `/api/order` - Checkout, order history, dashboard order listing, status updates

## Project File Outline

```text
bautista-advwebprog-longexam/
├── README.md
├── bautista-client/                     # React + Vite frontend
│   ├── .env                             # VITE_API_URL (not committed)
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                      # Route tree (Layout / AuthLayout / DashLayout)
│       ├── main.jsx                     # React root, wraps App with AuthProvider
│       ├── constants.js                 # Reads VITE_API_URL into HOST
│       ├── assets/
│       │   ├── product-content.js       # Static sample product data
│       │   ├── img/                     # Banners, logo, placeholder images
│       │   └── styles/index.css         # Tailwind entry stylesheet
│       ├── components/                  # Reusable, presentation-focused components
│       │   ├── Button.jsx
│       │   ├── Footer.jsx
│       │   ├── NavBar.jsx
│       │   ├── ProductCard.jsx
│       │   └── ProductList.jsx
│       ├── context/
│       │   └── AuthContext.jsx          # Provider/Context pattern for auth state
│       ├── layouts/                     # Shared page chrome via <Outlet />
│       │   ├── Layout.jsx               # Public storefront layout (NavBar/Footer)
│       │   ├── AuthLayout.jsx           # Sign in/up layout
│       │   └── DashLayout.jsx           # Dashboard sidebar/topbar layout
│       ├── services/                    # Service Layer — axios calls per resource
│       │   ├── ProductService.js
│       │   ├── ReviewService.js
│       │   ├── OrderService.js
│       │   ├── CartService.js
│       │   └── UserService.js
│       └── pages/
│           ├── NotFoundPage.jsx
│           ├── AuthPages/
│           │   ├── SignInPage.jsx
│           │   └── SignUpPage.jsx
│           ├── LandingPages/            # Public storefront pages
│           │   ├── HomePage.jsx
│           │   ├── AboutPage.jsx
│           │   ├── ProductListPage.jsx
│           │   ├── ProductPage.jsx
│           │   ├── CartPage.jsx
│           │   ├── OrderPage.jsx
│           │   ├── ReviewPage.jsx
│           │   └── AccountPage.jsx
│           └── DashboardPages/          # Role-gated admin/seller pages
│               ├── DashboardPage.jsx
│               ├── DashProductListPage.jsx
│               ├── DashOrderListPage.jsx
│               ├── DashReviewListPage.jsx
│               ├── UsersPage.jsx
│               └── ReportsPage.jsx
│
└── bautista-server/                     # Express + MongoDB backend
    ├── .env                             # MONGO_URI, SECRET_KEY, SALT, PORT (not committed)
    ├── index.js                         # App entry: middleware, route mounting, DB connect
    ├── package.json
    ├── config/
    │   ├── config.js                    # Reads env vars
    │   ├── constants.js                 # HttpStatus and other shared constants
    │   └── db.js                        # Mongoose connection setup
    ├── middleware/
    │   └── authMiddleware.js            # JWT verification middleware
    ├── models/                          # Mongoose schemas
    │   ├── productModel.js
    │   ├── categoryModel.js
    │   ├── userModel.js
    │   ├── reviewModel.js
    │   ├── cartModel.js
    │   └── orderModel.js
    ├── controllers/                     # Business logic / request handlers
    │   ├── productController.js
    │   ├── categoryController.js
    │   ├── userController.js
    │   ├── reviewController.js
    │   ├── cartController.js
    │   └── orderController.js
    └── routes/                          # Express routers mapping URLs to controllers
        ├── productRoutes.js
        ├── categoryRoutes.js
        ├── userRoutes.js
        ├── reviewRoutes.js
        ├── cartRoutes.js
        ├── orderRoutes.js
        └── v1/
            └── productRoutes.js         # Versioned product endpoints
```

## Notes

- `node_modules/`, `dist/`, and `.env` files are not included in the structure above (generated/gitignored).
- The application uses `Layout.jsx` for public pages, `AuthLayout.jsx` for authentication pages, and `DashLayout.jsx` for the role-gated dashboard.
- Product routes use the product `name`/`id` value as the URL slug.
- `role` (`admin`, `seller`, `buyer`) drives both UI branching on the client and query scoping on the server.