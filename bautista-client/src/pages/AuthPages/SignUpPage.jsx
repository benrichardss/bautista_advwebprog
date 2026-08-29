import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import { useState } from 'react';
import { createUser } from '../../services/UserService';

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

const SignUpPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const { confirmPassword, ...userData } = form;

      await createUser({
        ...userData,
        role: 'buyer',
        isActive: true,
      });
      navigate('/auth/signin');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
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
      <h1 className="text-3xl font-lexend font-bold tracking-tight text-zinc-900 sm:text-4xl">Sign Up</h1>
      <p className="mt-3 font-lexend text-sm leading-6 text-zinc-600">
        Already have an account?{' '}
        <Link to="/auth/signin" className="font-semibold text-zinc-900">
          Sign in
        </Link>
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="text-sm font-lexend font-medium text-zinc-700">
              First name
            </label>
            <input
              value={form.firstName}
              onChange={handleChange('firstName')}
              placeholder="First name"
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-lexend font-medium text-zinc-700">
              Last name
            </label>
            <input
              value={form.lastName}
              onChange={handleChange('lastName')}
              placeholder="Last name"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-lexend font-medium text-zinc-700">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="Email"
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Contact number</label>
          <input
            type="tel"
            value={form.contactNumber}
            onChange={handleChange('contactNumber')}
            placeholder="Contact number"
            className={inputClasses}
            pattern="09[0-9]{9}"
            minLength={11}
            maxLength={11}
            title="Enter a valid Philippine mobile number starting with 09."
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Address</label>
          <textarea
            value={form.address}
            onChange={handleChange('address')}
            placeholder="Address"
            rows={3}
            className={`${inputClasses} resize-none`}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-lexend font-medium text-zinc-700">
            Password
          </label>

          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
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

          <p className="mt-2 text-xs leading-5 font-lexend text-zinc-500">
            Use a secure password with letters, numbers, and symbols.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="text-sm font-lexend font-medium text-zinc-700">
            Confirm Password
          </label>

          <div className="relative mt-2">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
              placeholder="Confirm password"
              className={`${inputClasses.replace('mt-2 ', '')} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-zinc-500 transition hover:text-zinc-900"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" variant="tertiary" className={actionButtonClassName}>
          Create Account
        </Button>
      </form>
    </>
  );
};

export default SignUpPage;
