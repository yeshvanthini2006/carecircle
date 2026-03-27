
import React, { useState, useEffect } from 'react';
import { User, CareRequest, Role } from './types';
import { INITIAL_USERS, INITIAL_REQUESTS, TRANSLATIONS } from './constants';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ElderDashboard from './pages/ElderDashboard';
import HelperDashboard from './pages/HelperDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LanguageSelection from './pages/LanguageSelection';
import { LogOut, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'English' | 'Tamil'>('English');
  const [view, setView] = useState<'language' | 'login' | 'signup' | 'dashboard'>('language');
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [requests, setRequests] = useState<CareRequest[]>(() => {
    const saved = localStorage.getItem('cc_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const t = TRANSLATIONS[language];

  // Persist data
  useEffect(() => {
    localStorage.setItem('cc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cc_requests', JSON.stringify(requests));
  }, [requests]);

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  const renderContent = () => {
    if (view === 'language') {
      return (
        <LanguageSelection 
          onSelect={(lang) => {
            setLanguage(lang);
            setView('login');
          }}
        />
      );
    }

    if (view === 'login') {
      return (
        <LoginPage 
          language={language}
          onLogin={(user) => {
            setCurrentUser(user);
            setLanguage(user.language); // Sync with user profile
            setView('dashboard');
          }}
          onGoToSignup={() => setView('signup')}
          users={users}
        />
      );
    }

    if (view === 'signup') {
      return (
        <SignupPage 
          language={language}
          onSignup={(newUser) => {
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser);
            setView('dashboard');
          }}
          onGoToLogin={() => setView('login')}
        />
      );
    }

    if (currentUser) {
      switch (currentUser.role) {
        case 'elder':
          return (
            <ElderDashboard 
              language={language}
              user={currentUser} 
              requests={requests.filter(r => r.elderId === currentUser.id)}
              onCreateRequest={(req) => setRequests(prev => [req, ...prev])}
              onCancelRequest={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))}
              onCompletePayment={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r))}
              onPayRequest={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, isPaid: true } : r))}
              onAddFeedback={(id, rating, feedback) => setRequests(prev => prev.map(r => r.id === id ? { ...r, rating, feedback } : r))}
            />
          );
        case 'helper':
          return (
            <HelperDashboard 
              language={language}
              user={currentUser}
              allRequests={requests}
              onUpdateStatus={(id, status) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))}
              onAcceptRequest={(id) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'assigned', helperId: currentUser.id } : r))}
            />
          );
        case 'admin':
          return (
            <AdminDashboard 
              language={language}
              users={users}
              requests={requests}
              onUpdateUserStatus={(id, status) => setUsers(prev => prev.map(u => u.id === id ? { ...u, verificationStatus: status } : u))}
            />
          );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => !currentUser && setView('language')}>
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              C
            </div>
            <span className="text-xl font-bold text-emerald-900">CareCircle</span>
          </div>
          
          <div className="flex items-center gap-4">
            {view !== 'language' && !currentUser && (
              <button 
                onClick={() => setView('language')}
                className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-medium text-sm transition-colors"
              >
                <Globe size={18} /> {language}
              </button>
            )}

            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold">{currentUser.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{t[currentUser.role as keyof typeof t] || currentUser.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors"
                  title={t.logout}
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} CareCircle.
        </div>
      </footer>
    </div>
  );
};

export default App;
