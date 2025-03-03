import React from 'react';

const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-800 py-4 mt-8">
    <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
      <p>Data provided by CoinGecko API</p>
      <p className="mt-1">© {new Date().getFullYear()} CryptoTracker. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;