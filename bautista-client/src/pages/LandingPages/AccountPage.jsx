import { useState } from 'react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import {
  updateUser,
  changePassword,
} from '../../services/UserService';

const inputClasses =
  'mt-2 w-full rounded-xl border-2 border-zinc-300 bg-zinc-50 px-4 py-3 text-sm font-lexend text-zinc-900 outline-none focus:border-zinc-900';

const EyeIcon = ({ hidden }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {hidden ? (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.9 5.1A10.7 10.7 0 0 1 12 4.9c6 0 9.75 7.1 9.75 7.1a17.3 17.3 0 0 1-4.1 4.8M6.2 6.2C3.8 7.8 2.25 12 2.25 12s3.75 7.1 9.75 7.1c1.2 0 2.3-.2 3.4-.6"
        />
      </>
    ) : (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12s3.75-7.1 9.75-7.1S21.75 12 21.75 12s-3.75 7.1-9.75 7.1S2.25 12 2.25 12Z"
        />
        <circle cx="12" cy="12" r="2.5" />
      </>
    )}
  </svg>
);

const AccountPage = () => {
  const { user, login } = useAuth();
  const userId = user?.id || user?._id;

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
    });
  const [error, setError] = useState('');

  const handleProfileChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordChange = (event) => {
    setPassword({
      ...password,
      [event.target.name]: event.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({
        ...current,
        [field]: !current[field],
    }));
    };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setProfileMessage('');

    try {
      const { data } = await updateUser(userId, profile);

      login(data.data);
      setProfileMessage('Profile updated successfully.');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update profile.'
      );
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');

    if (password.newPassword !== password.confirmNewPassword) {
        setError('Passwords do not match.');
        return;
    }

    try {
        const { data } = await changePassword(userId, password);

        setPassword({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        });

        setPasswordMessage(
        data.message || 'Password changed successfully.'
        );
    } catch (requestError) {
        setError(
        requestError.response?.data?.message ||
            'Unable to change password.'
        );
    }
    };

  if (!user) {
    return (
      <section className="border-y-2 border-zinc-900 bg-zinc-50 p-6">
        <h1 className="font-lexend text-2xl font-bold">
          Please sign in to manage your account.
        </h1>
        <Button to="/auth/signin" className="mt-6">
          Sign In
        </Button>
      </section>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="text-[11px] font-lexend font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-lexend font-bold text-zinc-900">
          Manage your account
        </h1>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-lexend font-semibold text-zinc-900">
            Personal information
          </h2>

          {error && (
            <p className="mt-4 text-sm font-lexend text-red-600">
              {error}
            </p>
          )}

          {profileMessage && (
            <p className="mt-4 text-sm font-lexend text-green-700">
              {profileMessage}
            </p>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="font-lexend text-sm">
                First name
                <input
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  className={inputClasses}
                  required
                />
              </label>

              <label className="font-lexend text-sm">
                Last name
                <input
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  className={inputClasses}
                  required
                />
              </label>
            </div>

            <label className="block font-lexend text-sm">
              Email
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className={inputClasses}
                required
              />
            </label>

            <label className="block font-lexend text-sm">
              Contact number
              <input
                type="tel"
                name="contactNumber"
                value={profile.contactNumber}
                onChange={handleProfileChange}
                className={inputClasses}
                pattern="09[0-9]{9}"
                minLength={11}
                maxLength={11}
                title="Enter a valid Philippine mobile number starting with 09."
                required
              />
            </label>

            <label className="block font-lexend text-sm">
              Address
              <textarea
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                rows="3"
                className={inputClasses}
              />
            </label>

            <button
              type="submit"
              className="rounded-full border-2 border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Save profile
            </button>
          </form>
        </div>
      </section>

      <section className="border-y-2 border-zinc-900 bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-lexend font-semibold text-zinc-900">
            Change password
          </h2>

          {passwordMessage && (
            <p className="mt-4 text-sm font-lexend text-green-700">
              {passwordMessage}
            </p>
          )}

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            {[
                ['currentPassword', 'Current password'],
                ['newPassword', 'New password'],
                ['confirmNewPassword', 'Confirm new password'],
                ].map(([name, label]) => (
                <label key={name} className="block font-lexend text-sm">
                    {label}

                    <div className="relative">
                    <input
                        type={showPasswords[name] ? 'text' : 'password'}
                        name={name}
                        value={password[name]}
                        onChange={handlePasswordChange}
                        className={`${inputClasses.replace('mt-2 ', '')} pr-12`}
                        minLength={name === 'currentPassword' ? undefined : 8}
                        required
                    />

                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility(name)}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-zinc-500 hover:text-zinc-900"
                        aria-label={showPasswords[name] ? `Hide ${label}` : `Show ${label}`}
                    >
                        <EyeIcon hidden={showPasswords[name]} />
                    </button>
                    </div>
                </label>
                ))}

            <button
              type="submit"
              className="rounded-full border-2 border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Change password
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AccountPage;