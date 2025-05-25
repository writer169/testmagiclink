// src/components/AccountActions.tsx
'use client'; // Обозначаем как Клиентский Компонент

import LogoutButton from '@/components/LogoutButton';

export default function AccountActions() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Account Actions
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <LogoutButton /> {/* LogoutButton также должен быть Клиентским Компонентом или не принимать интерактивные пропсы от сервера */}
        
        <button 
          onClick={handleRefresh}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
        >
          Refresh Session
        </button>
      </div>
    </div>
  );
}