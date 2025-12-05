import {
  ArrowLeft,
  Camera,
  Key,
  Mail,
  Pencil,
  Save,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/useAuth';
import { api, ApiValidationError } from '../lib/api';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoFocus?: boolean;
  className?: string;
  readOnly?: boolean;
  actionButton?: React.ReactNode;
  inputClassName?: string;
}

function FormField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoFocus,
  className,
  readOnly,
  actionButton,
  inputClassName,
}: FormFieldProps) {
  return (
    <div className={`form-control flex flex-col ${className ?? 'mb-4'}`}>
      <label className="label block">
        <span className="label-text">{label}</span>
      </label>
      {readOnly ? (
        <div className="flex items-center gap-2 w-full">
          <span className="flex-1 py-3 text-base-content">{value}</span>
          {actionButton}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`input input-bordered w-full ${error ? 'input-error' : ''} ${inputClassName ?? ''}`}
          autoFocus={autoFocus}
        />
      )}
      {error && (
        <label className="label block">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

type EmailChangeStep = 'idle' | 'request' | 'verify';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Email change state
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [devEmailCode, setDevEmailCode] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const response = await api.user.uploadAvatar(file);
      updateUser({ avatar: response.avatar });
      toast.success('Avatar updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      setError('');
      await api.user.deleteAvatar();
      updateUser({ avatar: null });
      toast.success('Avatar removed successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await api.user.updateProfile({ name: name.trim() });
      updateUser({ name: response.user.name });
      setIsEditingName(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditName = () => {
    setName(user?.name || '');
    setIsEditingName(false);
  };

  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    try {
      setEmailLoading(true);
      setEmailError('');
      const response = await api.user.emailChangeRequest({ email: newEmail.trim() });
      if (response.code) {
        setDevEmailCode(response.code);
      }
      setEmailChangeStep('verify');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setEmailError(err.getFieldError('email') || 'Invalid email');
      } else {
        setEmailError(err instanceof Error ? err.message : 'Failed to send verification code');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailChangeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailCode.length !== 6) {
      setEmailError('Please enter a 6-digit code');
      return;
    }

    try {
      setEmailLoading(true);
      setEmailError('');
      const response = await api.user.emailChangeVerify({
        email: newEmail.trim(),
        code: emailCode,
      });
      updateUser({ email: response.user.email });
      setEmailChangeStep('idle');
      setNewEmail('');
      setEmailCode('');
      setDevEmailCode(null);
      toast.success('Email updated successfully');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setEmailError(err.getFieldError('code') || 'Invalid code');
      } else {
        setEmailError(err instanceof Error ? err.message : 'Failed to verify code');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const cancelEmailChange = () => {
    setEmailChangeStep('idle');
    setNewEmail('');
    setEmailCode('');
    setDevEmailCode(null);
    setEmailError('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordFieldErrors({});

    if (newPassword !== confirmPassword) {
      setPasswordFieldErrors({ password_confirmation: 'Passwords do not match' });
      return;
    }

    try {
      setPasswordLoading(true);
      await api.user.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setPasswordFieldErrors(err.getFieldErrors());
      } else {
        setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordFieldErrors({});
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 border-b">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost btn-circle">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
        <div className="navbar-end"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-lg p-4">
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Avatar Section */}
        <div className="card bg-base-100 shadow-sm mb-4">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-sm text-base-content/70 mb-4">Profile Picture</h2>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Avatar with upload overlay */}
            <div className="relative group">
              {user.avatar ? (
                <div className="w-24 h-24 rounded-full overflow-hidden ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-primary-content flex items-center justify-center text-3xl font-medium ring ring-primary ring-offset-base-100 ring-offset-2">
                  {user.name ? getInitials(user.name) : <UserIcon className="h-10 w-10" />}
                </div>
              )}

              {/* Upload overlay */}
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <span className="loading loading-spinner loading-sm text-white"></span>
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </button>
            </div>

            <p className="text-sm text-base-content/60 mt-2">Click to upload a new photo</p>
            <p className="text-xs text-base-content/40">JPG, PNG, GIF or WebP. Max 2MB.</p>

            {user.avatar && (
              <button
                onClick={handleDeleteAvatar}
                disabled={uploading}
                className="btn btn-ghost btn-sm text-error mt-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="card bg-base-100 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/70 mb-4">Profile Information</h2>

            {isEditingName ? (
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input input-bordered flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn btn-primary btn-square"
                    title="Save"
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    disabled={saving}
                    className="btn btn-ghost btn-square"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <FormField
                label="Name"
                value={user.name}
                readOnly
                actionButton={
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="btn btn-ghost btn-square btn-sm"
                    title="Edit name"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Email Section */}
        <div className="card bg-base-100 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/70 mb-4">Email Address</h2>

            {emailError && (
              <div className="alert alert-error alert-sm mb-4">
                <span>{emailError}</span>
              </div>
            )}

            {emailChangeStep === 'idle' && (
              <div>
                <FormField label="Current Email" value={user.email} readOnly />
                <button
                  onClick={() => setEmailChangeStep('request')}
                  className="btn btn-outline btn-sm"
                >
                  <Mail className="h-4 w-4" />
                  Change Email
                </button>
              </div>
            )}

            {emailChangeStep === 'request' && (
              <form onSubmit={handleEmailChangeRequest}>
                <FormField
                  label="New Email Address"
                  type="email"
                  value={newEmail}
                  onChange={setNewEmail}
                  placeholder="Enter your new email"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEmailChange}
                    className="btn btn-ghost flex-1"
                    disabled={emailLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={emailLoading} className="btn btn-primary flex-1">
                    {emailLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Send Code'
                    )}
                  </button>
                </div>
              </form>
            )}

            {emailChangeStep === 'verify' && (
              <form onSubmit={handleEmailChangeVerify}>
                <p className="text-sm text-base-content/70 mb-4">
                  Enter the 6-digit code sent to <strong>{newEmail}</strong>
                </p>

                {devEmailCode && (
                  <div className="alert alert-info alert-sm mb-4">
                    <span>
                      Development code: <strong>{devEmailCode}</strong>
                    </span>
                  </div>
                )}

                <div className="form-control mb-4">
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="input input-bordered text-center text-2xl tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEmailChange}
                    className="btn btn-ghost flex-1"
                    disabled={emailLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading || emailCode.length !== 6}
                    className="btn btn-primary flex-1"
                  >
                    {emailLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Verify & Update'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="card bg-base-100 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="card-title text-sm text-base-content/70 mb-4">Password</h2>

            {passwordError && (
              <div className="alert alert-error alert-sm mb-4">
                <span>{passwordError}</span>
              </div>
            )}

            {!isChangingPassword ? (
              <div>
                <FormField label="Password" value="••••••••" readOnly />
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn btn-outline btn-sm"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword}>
                <FormField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter current password"
                  error={passwordFieldErrors.current_password}
                  autoFocus
                />
                <FormField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password"
                  error={passwordFieldErrors.password}
                />
                <FormField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm new password"
                  error={passwordFieldErrors.password_confirmation}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelPasswordChange}
                    className="btn btn-ghost flex-1"
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn btn-primary flex-1"
                  >
                    {passwordLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
