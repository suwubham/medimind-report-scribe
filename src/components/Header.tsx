
import { Activity, Brain } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600" />
              <Activity className="h-4 w-4 text-green-500 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MediMind</h1>
              <p className="text-sm text-gray-500">AI-Powered Medical Report Analysis</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">Secure</div>
              <div className="text-xs text-gray-500">HIPAA Compliant</div>
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
    </header>
  );
};
