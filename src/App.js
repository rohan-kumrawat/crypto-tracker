import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ComparisonChart from './components/ComparisonChart';
import CryptoTable from './components/CryptoTable';

const App = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'ascending' });
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [comparingMode, setComparingMode] = useState(false);
  const [currency, setCurrency] = useState('inr');
  const [timeRange, setTimeRange] = useState('24h');
  const [page, setPage] = useState(1);

  const currencySymbols = {
    'inr': '₹',
    'usd': '$',
    'eur': '€',
    'gbp': '£',
    'jpy': '¥'
  };

  const timeRanges = React.useMemo(()=>({
    '1h': 'price_change_percentage_1h_in_currency',
    '24h': 'price_change_percentage_24h_in_currency',
    '7d': 'price_change_percentage_7d_in_currency',
    '30d': 'price_change_percentage_30d_in_currency',
  }),[]);

  const fetchCryptoData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d,30d`
      );
      
      if (!response.ok) throw new Error('API limit reached or network error');
      
      const data = await response.json();
      setCryptoData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [currency, page]);

  React.useEffect(() => {
    fetchCryptoData();
    const intervalId = setInterval(fetchCryptoData, 120000);
    return () => clearInterval(intervalId);
  }, [fetchCryptoData]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...cryptoData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
                        
        let valueA = a[sortConfig.key];
        let valueB = b[sortConfig.key];
        
        if (sortConfig.key === timeRanges[timeRange]) {
          valueA = a.price_change_percentage_24h_in_currency;
          valueB = b.price_change_percentage_24h_in_currency;
        }
        
        return sortConfig.direction === 'ascending' 
          ? valueA - valueB 
          : valueB - valueA;
      });
    }
    return sortableItems;
  }, [cryptoData, sortConfig, timeRange, timeRanges]);

  const filteredData = useMemo(() => {
    return sortedData.filter(coin => 
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedData, searchTerm]);

  const toggleCryptoSelection = (crypto) => {
    if (selectedCryptos.some(c => c.id === crypto.id)) {
      setSelectedCryptos(selectedCryptos.filter(c => c.id !== crypto.id));
    } else {
      if (selectedCryptos.length < 4) {
        setSelectedCryptos([...selectedCryptos, crypto]);
      } else {
        alert("You can compare only up to 4 currencies.");
      }
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1e9) return `${currencySymbols[currency]}${(value/1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${currencySymbols[currency]}${(value/1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${currencySymbols[currency]}${(value/1e3).toFixed(2)}K`;
    return `${currencySymbols[currency]}${value.toFixed(2)}`;
  };

  const renderPriceChange = (percentage) => {
    if (percentage === null || percentage === undefined) return <span className="text-gray-500">N/A</span>;
    const textColorClass = percentage >= 0 ? "text-green-500" : "text-red-500";
    const arrow = percentage >= 0 ? "↑" : "↓";
    return <span className={`${textColorClass} font-semibold`}>{arrow} {Math.abs(percentage).toFixed(2)}%</span>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <Header currency={currency} setCurrency={setCurrency} fetchCryptoData={fetchCryptoData} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Search & Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search cryptocurrency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
            
            <button 
              onClick={() => {
                if (selectedCryptos.length >= 2) {
                  setComparingMode(!comparingMode);
                } else {
                  alert("Select at least 2 cryptocurrencies for comparison.");
                }
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCryptos.length >= 2 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              }`}
              disabled={selectedCryptos.length < 2}
            >
              {comparingMode ? 'Stop Comparison' : 'Compare'}
            </button>
          </div>
        </div>

        {/* Selected Cryptos */}
        {selectedCryptos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Selected Cryptocurrencies</h2>
            <div className="flex flex-wrap gap-2">
              {selectedCryptos.map(crypto => (
                <div key={crypto.id} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <img src={crypto.image} alt={crypto.name} className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium mr-2">{crypto.name}</span>
                  <button 
                    onClick={() => toggleCryptoSelection(crypto)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        {comparingMode && selectedCryptos.length >= 2 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">Cryptocurrency Comparison</h2>
            <ComparisonChart selectedCryptos={selectedCryptos} timeRange={timeRange} currency={currency} />
          </div>
        )}

        {/* Main Table */}
        <CryptoTable 
          loading={loading}
          filteredData={filteredData}
          sortConfig={sortConfig}
          handleSort={handleSort}
          selectedCryptos={selectedCryptos}
          toggleCryptoSelection={toggleCryptoSelection}
          currency={currency}
          timeRange={timeRange}
          formatCurrency={formatCurrency}
          renderPriceChange={renderPriceChange}
          page={page}
          setPage={setPage}
          error={error}
        />
      </main>

      <Footer />
    </div>
  );
};

export default App;