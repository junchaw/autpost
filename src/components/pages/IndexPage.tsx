import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Banner } from '../layout/Banner';

export function IndexPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Banner />
      <div className="hero min-h-[calc(100vh-64px)]">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">Welcome to Autpost</h1>
            <p className="py-6 text-lg text-base-content/70">
              A powerful dashboard application to help you manage your tasks, notes, and more. Get
              started by signing in or creating an account.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/sign-in" className="btn btn-primary">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn btn-ghost">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
