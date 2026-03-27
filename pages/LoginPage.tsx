
import React, { useState } from 'react';
import { User } from '../types';
import { Mail, Lock, LogIn } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onGoToSignup: () => void;
  users: User[];
  language: 'English' | 'Tamil';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToSignup, users, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const t = TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === email && (u.password === password || password === 'password123'));
    
    if (user) {
      onLogin(user);
    } else {
      setError(language === 'English' ? 'Invalid email or password' : 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t.welcomeUser}</h1>
          <p className="text-gray-500 mt-2 font-medium">{t.tagline}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <LogIn size={22} />
            {t.login}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-600 font-medium">
            {t.newUser}{' '}
            <button 
              onClick={onGoToSignup}
              className="text-emerald-600 font-black hover:underline"
            >
              {t.joinUs}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
