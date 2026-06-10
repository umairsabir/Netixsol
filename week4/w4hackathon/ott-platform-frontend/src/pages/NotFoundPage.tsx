import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Play } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-bg-custom flex flex-col items-center justify-center gap-6 px-4 text-center">
    <Play fill="currentColor" className="text-primary w-16 h-16 opacity-60" />
    <h1 className="text-text-p text-[72px] font-bold leading-none">404</h1>
    <p className="text-text-p text-[24px] font-semibold">Page not found</p>
    <p className="text-text-s text-[16px] max-w-[400px]">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 bg-primary text-text-p font-semibold text-[16px] px-6 py-3 rounded-[8px] hover:bg-red-700 transition-colors"
    >
      <Home size={20} />
      Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
