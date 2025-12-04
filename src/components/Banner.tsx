import { Palette } from 'lucide-react';
import { useTheme, THEMES } from '@/hooks/useTheme';

export function Banner() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="navbar bg-base-100 border-b">
      <div className="navbar-start">
        <div>
          <h1 className="text-2xl font-bold">Autpost</h1>
          <p className="text-sm text-base-content/60">Dashboard</p>
        </div>
      </div>
      <div className="navbar-end">
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
      </div>
    </div>
  );
}
