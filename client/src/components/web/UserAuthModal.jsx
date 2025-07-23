import React, { useState } from 'react';
import { FaUserCircle, FaLock, FaSmile, FaCheckCircle } from 'react-icons/fa';
import { registerUser, loginUser } from '../../utils/api';


const tabClasses = (active) =>
  `flex-1 py-2 text-center font-semibold rounded-t-lg cursor-pointer transition-colors duration-200 ${active ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-blue-50'}`;

const UserAuthModal = ({ show, onClose, onLogin, onRegister }) => {
  const [tab, setTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  // Validation
  const isLoginValid = loginData.email && loginData.password;
  const isRegisterValid =
    registerData.name &&
    registerData.email &&
    registerData.password &&
    registerData.confirm &&
    registerData.password === registerData.confirm &&
    registerData.password.length >= 6;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    
    try {
      const result = await loginUser(loginData);
      
      if (result.success) {
        // Store user data in localStorage or context
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        
        // Call parent callback
        onLogin && onLogin(result.user);
        
        // Close modal
        onClose();
        
        // Reset form
        setLoginData({ email: '', password: '' });
      } else {
        setLoginError(result.message || 'Login failed. Please try again. 😅');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Login failed. Please check your credentials. 😅');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setLoading(true);
    
    // Client-side validation
    if (registerData.password !== registerData.confirm) {
      setRegisterError('Passwords do not match! 🤔');
      setLoading(false);
      return;
    }
    
    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters!');
      setLoading(false);
      return;
    }
    
    try {
      // Prepare data for API (exclude confirm password)
      const userData = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      };
      
      const result = await registerUser(userData);
      
      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        if (result.token) {
          localStorage.setItem('token', result.token);
        }
        
        // Call parent callback
        onRegister && onRegister(result.user);
        
        // Close modal
        onClose();
        
        // Reset form
        setRegisterData({ name: '', email: '', password: '', confirm: '' });
      } else {
        setRegisterError(result.message || 'Registration failed. Please try again. 😅');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'Registration failed. Please try again. 😅');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-200/60 to-purple-200/60 backdrop-blur-[2px] transition-all">
      <div className="relative bg-white rounded-3xl shadow-2xl px-8 pt-10 pb-8 flex flex-col items-center max-w-md w-full border border-blue-100 animate-fadeIn">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-4 shadow-lg mb-2">
            {tab === 'login' ? <FaLock size={38} className="text-white" /> : <FaUserCircle size={38} className="text-white" />}
          </div>
          <h2 className="text-2xl font-extrabold text-blue-700 mb-1 flex items-center gap-2">
            {tab === 'login' ? 'Welcome Back! 😊' : 'Join the Fun! 🎉'}
          </h2>
          <div className="text-blue-400 text-sm font-semibold mb-2">
            {tab === 'login' ? 'Login to your account' : 'Create a new account'}
          </div>
        </div>
        <div className="flex w-full mb-6 transition-all duration-300">
          <div className={tabClasses(tab === 'login')} onClick={() => setTab('login')}>Login</div>
          <div className={tabClasses(tab === 'register')} onClick={() => setTab('register')}>Register</div>
        </div>
        {tab === 'login' && (
          <form className="w-full space-y-6 animate-fadeIn" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="email"
                className="peer w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-3 bg-transparent placeholder-transparent transition-all"
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                required
                placeholder="Email"
                id="login-email"
              />
              <label htmlFor="login-email" className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-4 peer-focus:text-blue-600 peer-focus:text-xs bg-white px-1 rounded">
                Email
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                className="peer w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-3 bg-transparent placeholder-transparent transition-all"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
                placeholder="Password"
                id="login-password"
              />
              <label htmlFor="login-password" className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-4 peer-focus:text-blue-600 peer-focus:text-xs bg-white px-1 rounded">
                Password
              </label>
            </div>
            {loginError && <div className="text-red-500 text-sm flex items-center gap-1"><FaSmile className="text-yellow-400" /> {loginError}</div>}
            <button
              type="submit"
              className={`w-full py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-xl text-lg shadow-md transition-all duration-200 ${!isLoginValid || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isLoginValid || loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
        {tab === 'register' && (
          <form className="w-full space-y-6 animate-fadeIn" onSubmit={handleRegister}>
            <div className="relative">
              <input
                type="text"
                className="peer w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-3 bg-transparent placeholder-transparent transition-all"
                value={registerData.name}
                onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                required
                placeholder="Name"
                id="register-name"
              />
              <label htmlFor="register-name" className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-4 peer-focus:text-blue-600 peer-focus:text-xs bg-white px-1 rounded">
                Name
              </label>
            </div>
            <div className="relative">
              <input
                type="email"
                className="peer w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-3 bg-transparent placeholder-transparent transition-all"
                value={registerData.email}
                onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                required
                placeholder="Email"
                id="register-email"
              />
              <label htmlFor="register-email" className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-4 peer-focus:text-blue-600 peer-focus:text-xs bg-white px-1 rounded">
                Email
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                className="peer w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-3 bg-transparent placeholder-transparent transition-all"
                value={registerData.password}
                onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                required
                placeholder="Password"
                id="register-password"
                minLength={6}
              />
              <label htmlFor="register-password" className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-4 peer-focus:text-blue-600 peer-focus:text-xs bg-white px-1 rounded">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                className="peer w-full border-b-2 border-blue-200 focus:border-blue-500 outline-none px-2 py-3 bg-transparent placeholder-transparent transition-all"
                value={registerData.confirm}
                onChange={e => setRegisterData({ ...registerData, confirm: e.target.value })}
                required
                placeholder="Confirm Password"
                id="register-confirm"
                minLength={6}
              />
              <label htmlFor="register-confirm" className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-4 peer-focus:text-blue-600 peer-focus:text-xs bg-white px-1 rounded">
                Confirm Password
              </label>
            </div>
            {registerError && <div className="text-red-500 text-sm flex items-center gap-1"><FaSmile className="text-yellow-400" /> {registerError}</div>}
            <button
              type="submit"
              className={`w-full py-2 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold rounded-xl text-lg shadow-md transition-all duration-200 ${!isRegisterValid || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isRegisterValid || loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserAuthModal; 