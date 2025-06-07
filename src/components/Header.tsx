
import { Activity, Brain, FileText, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600" />
              <Activity className="h-4 w-4 text-green-500 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MediMind</h1>
              <p className="text-sm text-gray-500">AI-Powered Medical Report Analysis</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link 
                to="/reports" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/reports' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Reports</span>
              </Link>
            </nav>

            {/* Feature highlights */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Secure</div>
                <div className="text-xs text-gray-500">Fully Encrypted</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Fast</div>
                <div className="text-xs text-gray-500">Instant Analysis</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">Nepali</div>
                <div className="text-xs text-gray-500">Native Language</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
