import { ArrowLeft, BookOpen, FileText, LayoutDashboard, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminLinkProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AdminLink({ to, icon, title, description }: AdminLinkProps) {
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
  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 gap-2">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold">Admin</h1>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdminLink
            to="/dashboard"
            icon={<LayoutDashboard className="w-6 h-6" />}
            title="Dashboard"
            description="Go to main dashboard"
          />

          <AdminLink
            to="/admin/access-logs"
            icon={<FileText className="w-6 h-6" />}
            title="Access Logs"
            description="View and manage access logs"
          />

          <AdminLink
            to="/admin/roles"
            icon={<Shield className="w-6 h-6" />}
            title="Roles & Permissions"
            description="Manage roles and role bindings"
          />

          <AdminLink
            to="/docs"
            icon={<BookOpen className="w-6 h-6" />}
            title="API Documentation"
            description="View API documentation"
          />
        </div>
      </div>
    </div>
  );
}
