import { BookOpen, Database, FileText, Home, Shield, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Banner } from '../layout/Banner';

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

export function AdminPage() {
  const navigationPages: PageLink[] = [
    {
      to: '/',
      title: 'Home',
      description: 'Go to home page',
      icon: <Home className="w-6 h-6" />,
    },
    {
      to: '/docs',
      title: 'API Documentation',
      description: 'View API documentation',
      icon: <BookOpen className="w-6 h-6" />,
    },
  ];

  const adminPages: PageLink[] = [
    {
      to: '/admin/access-logs',
      title: 'Access Logs',
      description: 'View and manage access logs',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      to: '/admin/roles',
      title: 'Roles & Permissions',
      description: 'Manage roles and role bindings',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      to: '/admin/definitions',
      title: 'Generic Schema Definitions',
      description: 'Manage generic resource schemas',
      icon: <Database className="w-6 h-6" />,
    },
  ];

  const devToolsPages: PageLink[] = [
    {
      to: '/admin/dev-tools',
      title: 'Dev Tools',
      description: 'Developer tools and utilities',
      icon: <Wrench className="w-6 h-6" />,
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
          <h1 className="text-4xl font-bold mb-4">Admin</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Administrative tools and settings for managing the application.
          </p>
        </div>

        <PageSection title="Navigation" pages={navigationPages} />

        <PageSection title="Admin" pages={adminPages} />

        <PageSection title="Dev Tools" pages={devToolsPages} />
      </div>
    </div>
  );
}
