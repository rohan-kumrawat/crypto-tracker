import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import DecryptedText from '../blocks/TextAnimations/DecryptedText/DecryptedText';

const Header = ({ currency, setCurrency, fetchCryptoData, isDarkMode, toggleDarkMode }) => {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-2 md:mb-0"><DecryptedText text="CryptoTracker" /></h1>
         
          <div className="flex items-center space-x-2">
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white/90 dark:bg-gray-800 text-gray-800 dark:text-white rounded-md px-3 py-1 text-sm border border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="inr">INR (₹)</option>
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
              <option value="jpy">JPY (¥)</option>
            </select>
            <button 
              onClick={fetchCryptoData}
              className="bg-white/20 hover:bg-white/30 rounded-md px-3 py-1 text-sm transition"
            >
              Refresh
            </button>
            <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          {isDarkMode ? (
            <FiMoon className="w-5 h-5 text-gray-300" />
          ) : (
            <FiSun className="w-5 h-5 text-yellow-400" />
          )}
        </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;