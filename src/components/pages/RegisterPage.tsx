import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiValidationError, authApi, setAuthToken } from '@/lib/api';

type Step = 'form' | 'verify';

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      // Save dev code if provided
      if (response.code) {
        setDevCode(response.code);
      }
      setStep('verify');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.getFieldErrors());
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.registerVerify({ email, code });
      // Set token and navigate to dashboard
      setAuthToken(response.token);
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.getFieldErrors());
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (response.code) {
        setDevCode(response.code);
      }
      setError(''); // Clear any previous errors
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl justify-center mb-2">Verify Email</h2>
            <p className="text-center text-base-content/70 mb-4">
              Enter the 6-digit code sent to {email}
            </p>

            {devCode && (
              <div className="alert alert-info mb-4">
                <span className="text-sm">
                  Development code: <strong>{devCode}</strong>
                </span>
              </div>
            )}

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Verification Code</span>
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  className={`input input-bordered w-full text-center text-2xl tracking-widest ${fieldErrors.code ? 'input-error' : ''}`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                />
                {fieldErrors.code && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.code}</span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full mb-3"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>

              <div className="divider">or</div>

              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => setStep('form')}
              >
                Back to Registration
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-4">Create Account</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterRequest}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className={`input input-bordered w-full ${fieldErrors.name ? 'input-error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              {fieldErrors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{fieldErrors.name}</span>
                </label>
              )}
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className={`input input-bordered w-full ${fieldErrors.email ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{fieldErrors.email}</span>
                </label>
              )}
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className={`input input-bordered w-full ${fieldErrors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {fieldErrors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{fieldErrors.password}</span>
                </label>
              )}
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className={`input input-bordered w-full ${fieldErrors.password_confirmation ? 'input-error' : ''}`}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
              {fieldErrors.password_confirmation && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {fieldErrors.password_confirmation}
                  </span>
                </label>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <Link to="/sign-in" className="btn btn-ghost w-full">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
