import React from 'react';

interface HeaderProps {
  isAdminView: boolean;
  onToggleView: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdminView, onToggleView }) => {
  return (
    <header className="bg-night-light shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <div className="text-2xl font-bold tracking-wider text-white">
              <span className="text-brand-pink">Midnight</span>
              <span className="text-brand-blue">Madness</span>
            </div>
          </div>
          <nav>
             <button
              onClick={onToggleView}
              className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors text-sm font-medium"
            >
              {isAdminView ? '← Back to Customer View' : 'Admin Dashboard'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;