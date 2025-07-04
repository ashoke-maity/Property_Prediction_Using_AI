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


function Header() {
  const [active, setActive] = useState('Home');
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
                onClick={() => setActive(link.label)}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute left-0 -bottom-1 w-full h-0.5 rounded bg-blue-400 transition-all duration-200 ${active === link.label ? 'opacity-100' : 'opacity-0 scale-x-0'} group-hover:scale-x-100`}
                />
              </a>
            ))}
          </nav>
          {/* Login Button */}
          <a
            href="#login"
            className="flex items-center gap-1 text-gray-200 hover:text-blue-400 text-sm font-semibold transition-colors px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm"
          >
            <FaUserCircle size={18} /> Login
          </a>
        </div>
      </header>
      {/* Mobile Floating Bottom Navbar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-between items-center w-[95vw] max-w-md px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/10">
        {navLinks.map(link => (
          <button
            key={link.label}
            onClick={() => setActive(link.label)}
            className={`flex flex-col items-center justify-center flex-1 text-xs transition-colors ${active === link.label ? 'text-blue-400' : 'text-gray-300'}`}
          >
            {link.icon}
            <span className={`mt-0.5 transition-opacity duration-150 ${active === link.label ? 'opacity-100' : 'opacity-0'}`}>{link.label}</span>
          </button>
        ))}
        {/* Login as last tab */}
        <button
          onClick={() => setActive('Login')}
          className={`flex flex-col items-center justify-center flex-1 text-xs transition-colors ${active === 'Login' ? 'text-blue-400' : 'text-gray-300'}`}
        >
          <FaUserCircle size={20} />
          <span className={`mt-0.5 transition-opacity duration-150 ${active === 'Login' ? 'opacity-100' : 'opacity-0'}`}>Login</span>
        </button>
      </nav>
    </>
  );
}

export default Header;