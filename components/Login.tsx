
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { ALLOWED_ROLL_NUMBERS, ADMIN_CREDENTIALS, COLLEGE_NAME } from '../constants';
import { Button } from './Button';
import { LogIn, User as UserIcon, Shield, Users } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === UserRole.ADMIN) {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        onLogin({ id: 'admin', username, role: UserRole.ADMIN });
      } else {
        setError('Invalid admin credentials.');
      }
    } else {
      // Student or Parent logic
      const rollName = ALLOWED_ROLL_NUMBERS[username];
      const last4 = username.slice(-4);
      
      if (rollName && password === last4) {
        onLogin({ 
          id: username, 
          username, 
          role, 
          rollNumber: username 
        });
      } else if (!rollName) {
        setError('Unauthorized roll number.');
      } else {
        setError('Incorrect password (last 4 digits of roll number).');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-blue-900 text-xl font-bold tracking-tight px-4 leading-tight">
            {COLLEGE_NAME}
          </h1>
          <p className="text-blue-600/60 mt-2 text-sm uppercase tracking-widest font-semibold">
            Student Profile Management System
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
          <div className="bg-gray-50/50 p-6 flex justify-around border-b border-gray-100">
            <button 
              type="button"
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex flex-col items-center space-y-1 transition-all ${role === UserRole.STUDENT ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-50 hover:opacity-100'}`}
            >
              <div className={`p-2 rounded-full ${role === UserRole.STUDENT ? 'bg-blue-100' : ''}`}>
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold">STUDENT</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole(UserRole.PARENT)}
              className={`flex flex-col items-center space-y-1 transition-all ${role === UserRole.PARENT ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-50 hover:opacity-100'}`}
            >
              <div className={`p-2 rounded-full ${role === UserRole.PARENT ? 'bg-blue-100' : ''}`}>
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold">PARENT</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex flex-col items-center space-y-1 transition-all ${role === UserRole.ADMIN ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-50 hover:opacity-100'}`}
            >
              <div className={`p-2 rounded-full ${role === UserRole.ADMIN ? 'bg-blue-100' : ''}`}>
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold">ADMIN</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                {role === UserRole.ADMIN ? 'Username' : 'Roll Number'}
              </label>
              <input 
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                placeholder={role === UserRole.ADMIN ? 'Enter username' : '112723205XXX'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Password</label>
              <input 
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-2 text-[10px] text-gray-400 italic">
                {role === UserRole.ADMIN ? 'Restricted access only.' : 'Use last 4 digits of roll number.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98]">
              <LogIn className="w-5 h-5 mr-2" /> Sign In as {role}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">
            © 2024 SPCET IT Department | Academic Management
          </p>
        </div>
      </div>
    </div>
  );
};
