import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiValidationError, authApi } from '@/lib/api';

type Step = 'email' | 'verify' | 'reset' | 'success';

export function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.passwordResetRequest({ email });
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
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      await authApi.passwordResetVerify({ email, code });
      setStep('reset');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.getFieldErrors());
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      await authApi.passwordReset({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      });
      setStep('success');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.getFieldErrors());
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.passwordResetRequest({ email });
      if (response.code) {
        setDevCode(response.code);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-success/20 p-4">
                <KeyRound className="h-8 w-8 text-success" />
              </div>
            </div>
            <h2 className="card-title text-2xl justify-center mb-2">Password Reset!</h2>
            <p className="text-base-content/70 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link to="/sign-in" className="btn btn-primary w-full">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl justify-center mb-2">Set New Password</h2>
            <p className="text-center text-base-content/70 mb-4">Enter your new password below.</p>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className={`input input-bordered w-full ${fieldErrors.password ? 'input-error' : ''}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                {fieldErrors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.password}</span>
                  </label>
                )}
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
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
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl justify-center mb-2">Verify Code</h2>
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

            <form onSubmit={handleVerifyCode}>
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
                  'Verify Code'
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
                onClick={() => setStep('email')}
              >
                Use Different Email
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
          <h2 className="card-title text-2xl justify-center mb-2">Reset Password</h2>
          <p className="text-center text-base-content/70 mb-4">
            Enter your email to receive a verification code.
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRequestCode}>
            <div className="form-control mb-6">
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
                autoFocus
              />
              {fieldErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{fieldErrors.email}</span>
                </label>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <Link to="/sign-in" className="btn btn-ghost w-full">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
