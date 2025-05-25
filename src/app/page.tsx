import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function HomePage() {
  const session = await getSession();

  // Если пользователь не авторизован, перенаправляем на страницу ошибки
  if (!session || !session.isAuthorized) {
    redirect('/auth/error?error=unauthorized&message=Authentication required');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              You have successfully authenticated via magic link
            </p>
          </div>

          {/* Session Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Session Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Application ID
                  </label>
                  <p className="text-lg font-mono bg-gray-50 p-3 rounded-lg border">
                    {session.appId}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Session ID
                  </label>
                  <p className="text-lg font-mono bg-gray-50 p-3 rounded-lg border">
                    {session.sessionId}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Authorized At
                  </label>
                  <p className="text-lg bg-gray-50 p-3 rounded-lg border">
                    {new Date(session.authorizedAt).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Authenticated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Account Actions
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <LogoutButton />
              
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Refresh Session
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-500">
            <p>Your session will automatically refresh as you browse the application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}