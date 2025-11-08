
import React, { useState } from 'react';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle Firebase auth here.
    // For this mock, we'll just log in successfully.
    onAuthSuccess();
  };

  const commonInputClasses = "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500";
  const commonButtonClasses = "w-full py-3 font-bold text-gray-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <h1 className="text-4xl font-bold text-center text-amber-400 mb-2">KDM Signal</h1>
        <p className="text-center text-gray-400 mb-8">
          {isLogin ? 'Welcome Back' : 'Create a New Account'}
        </p>
        
        <div className="flex border-b border-gray-600 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${isLogin ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${!isLogin ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <input 
                type="text" 
                placeholder="Full Name" 
                className={commonInputClasses}
              />
            </div>
          )}
          <div>
            <input 
              type="email" 
              placeholder="Email Address" 
              className={commonInputClasses}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className={commonInputClasses}
              required
            />
          </div>

          <button type="submit" className={commonButtonClasses}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;