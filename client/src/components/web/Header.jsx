import React, { useState } from 'react';
import { FaHome, FaInfoCircle, FaQuestionCircle, FaUserCircle } from 'react-icons/fa';
import { MdContactSupport } from 'react-icons/md';
import logo_Img from '../../assets/logo.png';

const navLinks = [
  { href: '#home', label: 'Home', icon: <FaHome size={20} /> },
  { href: '#about', label: 'About', icon: <FaInfoCircle size={20} /> },
  { href: '#how', label: 'How it works', icon: <FaQuestionCircle size={20} /> },
  { href: '#contact', label: 'Contact', icon: <MdContactSupport size={20} /> },
];


function Header({ onAboutClick, onHowClick, onContactClick, onLoginClick, user, isAuthenticated, onLogout }) {
  const [active, setActive] = useState('Home');
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <>
      {/* Desktop Navbar */}
      <header className="hidden md:flex fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-sm font-sans h-14 items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer transition-transform duration-150 hover:scale-105">
            <div>
              <img src={logo_Img} width={190} alt="logo" />
            </div>
          </div>
          {/* Centered Nav Links */}
          <nav className="flex-1 flex justify-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-gray-200 hover:text-blue-400 text-sm font-medium px-2 transition-colors duration-150"
                onClick={e => {
                  setActive(link.label);
                  if (link.label === 'About' && onAboutClick) {
                    e.preventDefault();
                    onAboutClick();
                  }
                  if (link.label === 'How it works' && onHowClick) {
                    e.preventDefault();
                    onHowClick();
                  }
                  if (link.label === 'Contact' && onContactClick) {
                    e.preventDefault();
                    onContactClick();
                  }
                }}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute left-0 -bottom-1 w-full h-0.5 rounded bg-blue-400 transition-all duration-200 ${active === link.label ? 'opacity-100' : 'opacity-0 scale-x-0'} group-hover:scale-x-100`}
                />
              </a>
            ))}
          </nav>
          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 text-gray-200 hover:text-blue-400 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUserCircle size={18} />
                <span>Hi, {user.name}</span>
                <span className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="flex items-center gap-1 text-gray-200 hover:text-blue-400 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm"
              onClick={onLoginClick}
            >
              <FaUserCircle size={18} /> Login
            </button>
          )}
        </div>
      </header>
      {/* Mobile Floating Bottom Navbar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-between items-center w-[95vw] max-w-md px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
        {navLinks.map(link => (
          <button
            key={link.label}
            onClick={() => {
              setActive(link.label);
              if (link.label === 'About' && onAboutClick) onAboutClick();
              if (link.label === 'How it works' && onHowClick) onHowClick();
              if (link.label === 'Contact' && onContactClick) onContactClick();
            }}
            className={`flex flex-col items-center justify-center flex-1 text-xs transition-colors ${active === link.label ? 'text-blue-400' : 'text-gray-300'}`}
          >
            {link.icon}
            <span className={`mt-0.5 transition-opacity duration-150 ${active === link.label ? 'opacity-100' : 'opacity-0'}`}>{link.label}</span>
          </button>
        ))}
        {/* User/Login as last tab */}
        {isAuthenticated && user ? (
          <button
            onClick={() => { 
              setActive('User'); 
              setShowUserMenu(!showUserMenu);
            }}
            className={`flex flex-col items-center justify-center flex-1 text-xs transition-colors ${active === 'User' ? 'text-blue-400' : 'text-gray-300'}`}
          >
            <FaUserCircle size={20} />
            <span className={`mt-0.5 transition-opacity duration-150 ${active === 'User' ? 'opacity-100' : 'opacity-0'}`}>
              {user.name.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={() => { setActive('Login'); if (onLoginClick) onLoginClick(); }}
            className={`flex flex-col items-center justify-center flex-1 text-xs transition-colors ${active === 'Login' ? 'text-blue-400' : 'text-gray-300'}`}
          >
            <FaUserCircle size={20} />
            <span className={`mt-0.5 transition-opacity duration-150 ${active === 'Login' ? 'opacity-100' : 'opacity-0'}`}>Login</span>
          </button>
        )}
        
        {/* Mobile User Menu */}
        {isAuthenticated && user && showUserMenu && (
          <div className="absolute bottom-16 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={() => {
                onLogout();
                setShowUserMenu(false);
                setActive('Home');
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;