import { LayoutDashboard, User, Shield, BookOpen, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Banner } from '../layout/Banner';
import { useAuth } from '@/contexts/useAuth';

interface PageLink {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function PageLinkCard({ to, icon, title, description }: PageLink) {
  return (
    <Link
      to={to}
      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-base-content/60">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function IndexPage() {
  const { isAuthenticated } = useAuth();

  const publicPages: PageLink[] = [
    {
      to: '/docs',
      title: 'API Docs',
      description: 'Browse the API documentation',
      icon: <BookOpen className="w-6 h-6" />,
    },
  ];

  const authPages: PageLink[] = [
    {
      to: '/sign-in',
      title: 'Sign In',
      description: 'Sign in to your account',
      icon: <LogIn className="w-6 h-6" />,
    },
    {
      to: '/register',
      title: 'Register',
      description: 'Create a new account',
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      to: '/forgot-password',
      title: 'Forgot Password',
      description: 'Reset your password',
      icon: <KeyRound className="w-6 h-6" />,
    },
  ];

  const protectedPages: PageLink[] = [
    {
      to: '/dashboard',
      title: 'Dashboard',
      description: 'View your main dashboard',
      icon: <LayoutDashboard className="w-6 h-6" />,
    },
    {
      to: '/profile',
      title: 'Profile',
      description: 'Manage your profile settings',
      icon: <User className="w-6 h-6" />,
    },
    {
      to: '/admin',
      title: 'Admin',
      description: 'Admin tools and settings',
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  const PageSection = ({ title, pages }: { title: string; pages: PageLink[] }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-base-content/80">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((link) => (
          <PageLinkCard key={link.to} {...link} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <Banner />
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Autpost</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            A powerful dashboard application to help you manage your tasks, notes, and more.
          </p>
        </div>

        <PageSection title="Public Pages" pages={publicPages} />

        {!isAuthenticated && <PageSection title="Authentication" pages={authPages} />}

        <PageSection title="Protected Pages" pages={protectedPages} />
      </div>
    </div>
  );
}
