import { THEMES, useTheme } from '@/hooks/useTheme';
import { LogIn, LogOut, Palette, Settings, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Banner() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100 border-b">
      <div className="navbar-start">
        <div>
          <h1 className="text-2xl font-bold">Autpost</h1>
          <p className="text-sm text-base-content/60">Dashboard</p>
        </div>
      </div>
      <div className="navbar-end gap-2">
        {/* Theme Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <Palette className="h-5 w-5" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow mt-3 max-h-96 overflow-y-auto"
          >
            {THEMES.map((t) => (
              <li key={t.value}>
                <button
                  onClick={() => setTheme(t.value)}
                  className={theme === t.value ? 'active' : ''}
                  data-set-theme={t.value}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Dropdown or Login Button */}
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              {user.avatar ? (
                <div className="w-9 rounded-full">
                  <img src={user.avatar} alt={user.name} />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                  {user.name ? getInitials(user.name) : <UserIcon className="h-5 w-5" />}
                </div>
              )}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-[1] mt-3 w-72 rounded-box bg-base-200 shadow-lg"
            >
              {/* User Info Section */}
              <div className="p-4 border-b border-base-300">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg font-medium">
                      {user.name ? getInitials(user.name) : <UserIcon className="h-6 w-6" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base-content truncate">{user.name}</p>
                    <p className="text-sm text-base-content/60 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="p-2">
                <Link
                  to="/profile"
                  className="btn btn-ghost btn-sm w-full justify-start gap-2 hover:bg-base-300"
                >
                  <Settings className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error hover:bg-error/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/sign-in" className="btn btn-primary btn-sm">
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
