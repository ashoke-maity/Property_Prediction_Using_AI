import React from 'react';
import Header from '../../components/web/Header';

function MainLayout() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <section
        className="relative w-screen min-h-screen flex items-center justify-center overflow-hidden p-0 m-0 pt-20 md:pt-28 font-sans bg-[#181C20]"
      >
        {/* Glowing Lights */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500 opacity-30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-40 h-40 bg-pink-500 opacity-20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 opacity-10 rounded-full blur-2xl pointer-events-none" />
        {/* Overlay for subtle darkness */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-8 w-full max-w-xl">
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-5 md:p-8 shadow-lg border border-white/10">
            <p className="text-sm md:text-base text-gray-200 font-family-sofia mb-5">
              Unlock Property Insights
            </p>
            <h1 className="md:text-3xl font-family-pecita text-white mb-3">
              Using AI
            </h1>
            <p className="text-sm md:text-base text-gray-200 font-normal mb-5">
              Discover accurate property price predictions and make smarter real estate decisions with AI-powered analytics.
            </p>
            <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm shadow transition-transform duration-150 hover:scale-105">
              Get Started
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export default MainLayout;