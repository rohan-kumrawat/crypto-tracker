import React from 'react';

const Header = ({ currency, setCurrency, fetchCryptoData }) => {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-2 md:mb-0">CryptoTracker</h1>
          <div className="flex items-center space-x-2">
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md px-3 py-1 text-sm border border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="inr">INR (₹)</option>
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
              <option value="jpy">JPY (¥)</option>
            </select>
            <button 
              onClick={fetchCryptoData}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md px-3 py-1 text-sm transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;