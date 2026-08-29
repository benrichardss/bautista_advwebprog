import React, { useState } from 'react';
import Button from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/UserService'
import { useAuth } from '../../context/AuthContext';

const inputClasses =
  'mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-lexend text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50';

const actionButtonClassName = 'w-full rounded-xl py-3 text-[11px] tracking-[0.2em]';

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
    />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.1A10.7 10.7 0 0 1 12 4.88c6 0 9.75 6.75 9.75 6.75a17.3 17.3 0 0 1-4.1 4.73M6.23 6.23C3.85 7.8 2.25 12 2.25 12s3.75 6.75 9.75 6.75c1.2 0 2.32-.22 3.35-.6"
    />
  </svg>
);

const SignInPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });
      console.log('Login successful: ', data);

      localStorage.setItem('token', data.token);
      login(data.user);

      navigate('/');
    } catch (err) {
      console.error('Login failed: ', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed, Please try again.');
    }
  };

  return (
    <>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-lexend text-zinc-600 transition hover:text-zinc-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Home
      </Link>
      <h1 className="text-3xl font-lexend font-bold tracking-tight text-zinc-900 sm:text-4xl">Sign In</h1>
      <p className="mt-3 text-sm leading-6 font-lexend text-zinc-600">
        Not a member?{' '}
        <Link to="/auth/signup" className="font-semibold text-zinc-900 transition hover:text-zinc-600">
          Sign Up
        </Link>
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="signin-email" className="text-sm font-lexend font-medium text-zinc-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className={inputClasses}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-lexend font-medium text-zinc-700">
            Password
          </label>

          <div className="relative mt-2">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className={`${inputClasses.replace('mt-2 ', '')} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-900"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="tertiary" className={actionButtonClassName}>
          Log In
        </Button>
      </form>
    </>
  );
};

export default SignInPage;
