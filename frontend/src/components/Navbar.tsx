import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Wallet, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/finance-coach', label: 'Finance Coach' },
  { to: '/investments', label: 'Advisor' },
  { to: '/financial-doc-analysis', label: 'Doc Analyzer' },
  { to: '/video-guides', label: 'Videos' },
  { to: '/advice', label: 'Advice' },
  { to: '/saved', label: 'Saved' },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo — always visible */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg p-1.5">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                InvestWise
              </span>
            </Link>
          </div>

          {/* Desktop nav — only when logged in */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'nav-link',
                    location.pathname === link.to && 'nav-link-active'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Spacer when not logged in — pushes right side to center */}
          {!isAuthenticated && <div className="hidden md:block" />}

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              /* Logged in: show user + logout */
              <>
                <div className="hidden md:flex items-center gap-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              /* Not logged in: show Login + Sign up */
              <>
                <Link
                  to="/login"
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signUp"
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated && (
              <>
                {/* User info on mobile */}
                <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                  </div>
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      location.pathname === link.to
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-2 text-sm font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signUp"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
